import type { NextApiRequest, NextApiResponse } from "next";

import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { getServerSession } from "next-auth/next";

import prisma from "@/lib/prisma";
import { CustomUser } from "@/lib/types";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = req.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname: string) => {
        // Generate a client token for the browser to upload the file

        const session = await getServerSession(req, res, authOptions);
        if (!session) {
          res.status(401).end("Unauthorized");
          throw new Error("Unauthorized");
        }

        const userId = (session.user as CustomUser).id;
        const team = await prisma.team.findFirst({
          where: {
            users: {
              some: {
                userId,
              },
            },
          },
          select: {
            plan: true,
          },
        });

        let maxSize = 30 * 1024 * 1024; // 30 MB
        const stripedTeamPlan = team?.plan.replace("+old", "");
        
        // Define plan types
        const isProPlan = stripedTeamPlan === "pro";
        const isBusinessPlan = stripedTeamPlan && 
          ["business", "datarooms", "datarooms-plus"].includes(stripedTeamPlan);
        
        if (isProPlan || isBusinessPlan) {
          maxSize = 100 * 1024 * 1024; // 100 MB
        }

        // Define allowed content types based on plan (three-tier system)
        
        // FREE PLAN: Basic files only
        const freeAllowedTypes = [
          "application/pdf", // .pdf
          "application/vnd.ms-excel", // .xls
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "text/csv", // .csv
          "application/vnd.oasis.opendocument.spreadsheet", // .ods
          "image/png", // .png
          "image/jpeg", // .jpeg
          "image/jpg", // .jpg
        ];

        // PRO PLAN: Free + "More file types: ppt, docx, excel"
        const proAllowedTypes = [
          ...freeAllowedTypes,
          "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
          "application/vnd.ms-powerpoint", // .ppt
          "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
          "application/vnd.oasis.opendocument.presentation", // .odp
          "application/msword", // .doc
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
          "application/vnd.oasis.opendocument.text", // .odt
        ];

        // BUSINESS+ PLANS: Pro + "More file types: dwg, kml, zip" + videos
        const businessAllowedTypes = [
          ...proAllowedTypes,
          // CAD files
          "image/vnd.dwg", // .dwg
          "image/vnd.dxf", // .dxf
          // Archive files
          "application/zip", // .zip
          "application/x-zip-compressed", // .zip
          // Map files
          "application/vnd.google-earth.kml+xml", // .kml
          "application/vnd.google-earth.kmz", // .kmz
          // Email files
          "application/vnd.ms-outlook", // .msg
          // Video files (only for business+ plans)
          "video/mp4", // .mp4
          "video/quicktime", // .mov
          "video/x-msvideo", // .avi
          "video/webm", // .webm
          "video/ogg", // .ogg
        ];

        // Select the appropriate file types based on plan
        let allowedContentTypes;
        if (isBusinessPlan) {
          allowedContentTypes = businessAllowedTypes;
        } else if (isProPlan) {
          allowedContentTypes = proAllowedTypes;
        } else {
          allowedContentTypes = freeAllowedTypes;
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: maxSize,
          metadata: JSON.stringify({
            // optional, sent to your server on upload completion
            userId: (session.user as CustomUser).id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of browser upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        try {
          // Run any logic after the file upload completed
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
        } catch (error) {
          // throw new Error("Could not update user");
        }
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    // The webhook will retry 5 times waiting for a 200
    return res.status(400).json({ error: (error as Error).message });
  }
}

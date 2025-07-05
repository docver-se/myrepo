import { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import { errorhandler } from "@/lib/errorHandler";
import prisma from "@/lib/prisma";
import { getClickEventsByViewHttp } from "@/lib/tinybird/http-client";
import { CustomUser } from "@/lib/types";
import { log } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).end("Unauthorized");
  }

  const { teamId, id, viewId } = req.query as {
    teamId: string;
    id: string;
    viewId: string;
  };

  const userId = (session.user as CustomUser).id;

  try {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
        users: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        plan: true,
      },
    });

    if (!team) {
      return res.status(401).end("Unauthorized");
    }

    if (team.plan.includes("free")) {
      return res.status(403).end("Forbidden");
    }

    const clickEvents = await getClickEventsByViewHttp({
      viewId,
    });

    return res.status(200).json(clickEvents);
  } catch (error) {
    log({
      message: `Failed to get click events for document ${id} and view ${viewId}. \n\n ${error}`,
      type: "error",
      mention: true,
    });
    return res.status(500).json({ error: "Failed to get click events" });
  }
}

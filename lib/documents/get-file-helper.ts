import { getFile } from "@/lib/files/get-file";
import prisma from "@/lib/prisma";

export const getFileForDocumentPage = async (
  pageNumber: number,
  documentId: string,
  versionNumber?: number,
): Promise<string> => {
  console.log(`Getting file for document page - Input parameters:`, {
    pageNumber,
    documentId,
    versionNumber,
  });

  const documentVersions = await prisma.documentVersion.findMany({
    where: {
      documentId: documentId,
      ...(versionNumber
        ? { versionNumber: versionNumber }
        : { isPrimary: true }),
    },
    select: {
      id: true,
      versionNumber: true,
      documentId: true,
    },
    orderBy: {
      versionNumber: "desc",
    },
    take: 1,
  });

  console.log(`Found document versions:`, documentVersions);

  if (documentVersions.length === 0) {
    throw new Error(
      `Latest document version from document id ${documentId} not found`,
    );
  }

  const documentVersion = documentVersions[0];

  console.log(`Using document version:`, documentVersion);

  // Check what document pages exist for this version
  const allPagesForVersion = await prisma.documentPage.findMany({
    where: {
      versionId: documentVersion.id,
    },
    select: {
      pageNumber: true,
      versionId: true,
    },
    orderBy: {
      pageNumber: "asc",
    },
  });

  console.log(`All pages for version ${documentVersion.id}:`, allPagesForVersion);

  const documentPage = await prisma.documentPage.findUnique({
    where: {
      pageNumber_versionId: {
        pageNumber: pageNumber,
        versionId: documentVersion.id,
      },
    },
    select: {
      file: true,
      storageType: true,
    },
  });

  console.log(`Document page lookup result:`, {
    pageNumber,
    versionId: documentVersion.id,
    found: !!documentPage,
  });

  if (!documentPage) {
    console.error(`Debug info for missing document page:`, {
      pageNumber,
      documentId,
      versionNumber,
      versionId: documentVersion.id,
      requestedPageNumber: pageNumber,
    });
    
    throw new Error(
      `Document page ${pageNumber} with version id ${documentVersion.id} not found`,
    );
  }

  return getFile({
    type: documentPage.storageType,
    data: documentPage.file,
  });
};

import { Request, Response } from "express";
import { ResearchPatentEngine } from "../../services/researchPatentEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

/**
 * Controller for Enterprise Campus Research IP & Patent Licensing
 */
export const getPatents = async (req: Request, res: Response) => {
  const { campusName, technologyDomain, patentStatus, search } = req.query;

  const filters = {
    campusName: typeof campusName === 'string' ? campusName : undefined,
    technologyDomain: typeof technologyDomain === 'string' ? technologyDomain : undefined,
    patentStatus: typeof patentStatus === 'string' ? patentStatus : undefined,
    search: typeof search === 'string' ? search : undefined,
  };

  const results = await ResearchPatentEngine.getPatents(filters);
  return sendSuccess(res, { data: results, count: results.length });
};

export const registerPatent = async (req: Request, res: Response) => {
  const {
    patentTitle,
    campusName,
    leadInventorName,
    patentApplicationNumber,
    technologyDomain,
    licensingFeeUsd,
    royaltySharePercent,
    abstractDescription,
  } = req.body;

  if (!patentTitle || !campusName || !leadInventorName || !patentApplicationNumber) {
    throw AppError.badRequest("Missing required patent registration fields");
  }

  const created = await ResearchPatentEngine.registerPatent({
    patentTitle,
    campusName,
    leadInventorName,
    patentApplicationNumber,
    technologyDomain,
    licensingFeeUsd: Number(licensingFeeUsd) || 0,
    royaltySharePercent: Number(royaltySharePercent) || 0,
    abstractDescription: abstractDescription || "",
  });

  return sendSuccess(res, { data: created }, 201);
};

export const licensePatent = async (req: Request, res: Response) => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const { commercialPartnerName } = req.body;

  if (!id) throw AppError.badRequest("Patent ID is required");
  if (!commercialPartnerName) {
    throw AppError.badRequest("Commercial partner name is required for licensing");
  }

  const updated = await ResearchPatentEngine.licensePatent(id, commercialPartnerName);
  if (!updated) {
    throw AppError.notFound("Patent not found");
  }

  return sendSuccess(res, { data: updated });
};

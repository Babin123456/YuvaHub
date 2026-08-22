import { Request, Response } from "express";
import { AlumniEndowmentEngine } from "../../services/alumniEndowmentEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

/**
 * Controller for Enterprise Campus Alumni Endowment & Fellowship Grants
 */
export const getEndowments = async (req: Request, res: Response) => {
  const { campusName, fundCategory, grantStatus, search } = req.query;

  const filters = {
    campusName: typeof campusName === 'string' ? campusName : undefined,
    fundCategory: typeof fundCategory === 'string' ? fundCategory : undefined,
    grantStatus: typeof grantStatus === 'string' ? grantStatus : undefined,
    search: typeof search === 'string' ? search : undefined,
  };

  const results = await AlumniEndowmentEngine.getEndowments(filters);
  return sendSuccess(res, { data: results, count: results.length });
};

export const createEndowment = async (req: Request, res: Response) => {
  const {
    fundName,
    campusName,
    donorName,
    donorAlumniBatchYear,
    fundCategory,
    targetAmountUsd,
    initialContributionUsd,
    matchingGrantEnabled,
    matchingRatio,
    description,
  } = req.body;

  if (!fundName || !campusName || !donorName || !targetAmountUsd || !initialContributionUsd) {
    throw AppError.badRequest("Missing required endowment fund fields");
  }

  const created = await AlumniEndowmentEngine.createEndowment({
    fundName,
    campusName,
    donorName,
    donorAlumniBatchYear: Number(donorAlumniBatchYear) || new Date().getFullYear(),
    fundCategory,
    targetAmountUsd: Number(targetAmountUsd),
    initialContributionUsd: Number(initialContributionUsd),
    matchingGrantEnabled: Boolean(matchingGrantEnabled),
    matchingRatio: matchingRatio ? Number(matchingRatio) : undefined,
    description: description || "",
  });

  return sendSuccess(res, { data: created }, 201);
};

export const contributeToEndowment = async (req: Request, res: Response) => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const { contributionAmountUsd, donorName } = req.body;

  if (!id) throw AppError.badRequest("Endowment Fund ID required");
  if (!contributionAmountUsd || Number(contributionAmountUsd) <= 0) {
    throw AppError.badRequest("Valid contribution amount is required");
  }

  const updated = await AlumniEndowmentEngine.contributeToEndowment(
    id,
    Number(contributionAmountUsd),
    donorName || "Anonymous Alumnus"
  );

  if (!updated) {
    throw AppError.notFound("Endowment fund not found");
  }

  return sendSuccess(res, { data: updated });
};

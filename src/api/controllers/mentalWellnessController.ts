import { Request, Response } from "express";
import { StudentMentalWellnessEngine } from "../../services/mentalWellnessEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

/**
 * Controller for Student Mental Wellness & Campus Counseling Check-Ins
 */
export const getCheckIns = async (req: Request, res: Response) => {
  const { campusName, stressLevel, sessionStatus, search } = req.query;

  const filters = {
    campusName: typeof campusName === 'string' ? campusName : undefined,
    stressLevel: typeof stressLevel === 'string' ? stressLevel : undefined,
    sessionStatus: typeof sessionStatus === 'string' ? sessionStatus : undefined,
    search: typeof search === 'string' ? search : undefined,
  };

  const results = await StudentMentalWellnessEngine.getCheckIns(filters);
  return sendSuccess(res, { data: results, count: results.length });
};

export const createCheckIn = async (req: Request, res: Response) => {
  const {
    studentId,
    studentName,
    campusName,
    moodRating,
    stressLevel,
    primaryStressor,
    supportRequested,
  } = req.body;

  if (!studentId || !studentName || !campusName || moodRating === undefined || !stressLevel || !primaryStressor) {
    throw AppError.badRequest("Missing required mental wellness check-in fields");
  }

  const created = await StudentMentalWellnessEngine.createCheckIn({
    studentId,
    studentName,
    campusName,
    moodRating: Number(moodRating),
    stressLevel,
    primaryStressor,
    supportRequested: Boolean(supportRequested),
  });

  return sendSuccess(res, { data: created }, 201);
};

export const updateCheckInSession = async (req: Request, res: Response) => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const { sessionStatus, counselorNotes } = req.body;

  if (!id) throw AppError.badRequest("Check-in ID is required");
  if (!sessionStatus) throw AppError.badRequest("Session status is required");

  const updated = await StudentMentalWellnessEngine.updateSessionStatus(
    id,
    sessionStatus,
    counselorNotes
  );

  if (!updated) {
    throw AppError.notFound("Mental wellness check-in record not found");
  }

  return sendSuccess(res, { data: updated });
};

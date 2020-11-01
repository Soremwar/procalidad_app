import {
  create,
  DataType,
  findByTypeAndData,
} from "../models/users/data_review.ts";
import {
  dispatchHumanResourcesReview,
  dispatchHumanResourcesReviewRequested,
} from "../email/dispatchers.js";

const REVIEW_TYPE = DataType.DATOS_RESIDENCIA;

export const getReview = (
  data_reference: string,
) => {
  return findByTypeAndData(
    REVIEW_TYPE,
    data_reference,
  );
};

export const requestReview = async (
  data_reference: string,
) => {
  let review = await findByTypeAndData(
    REVIEW_TYPE,
    data_reference,
  );

  if (review) {
    await review.requestReview();
  } else {
    review = await create(
      REVIEW_TYPE,
      data_reference,
    );
  }

  await dispatchHumanResourcesReviewRequested(review.id);
};

export const setReview = async (
  data_reference: string,
  reviewer: number,
  approved: boolean,
  observations: string | null,
) => {
  let review = await findByTypeAndData(
    REVIEW_TYPE,
    data_reference,
  );

  if (!review) {
    throw new Error("No fue encontrada la revision del registro en el sistema");
  }

  if (approved) {
    await review.approve(reviewer);
  } else {
    await review.updateComments(
      reviewer,
      observations as string,
    );
  }

  await dispatchHumanResourcesReview(review.id);
};

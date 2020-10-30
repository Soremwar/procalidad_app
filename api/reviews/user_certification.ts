import {
  create,
  DataType,
  findByTypeAndData,
} from "../models/users/data_review.ts";
import { dispatchHumanResourcesReviewRequested } from "../email/dispatchers.js";

const REVIEW_TYPE = DataType.CERTIFICACION;

export const requestReview = async (
  data_reference: number,
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

export const deleteReview = async (
  data_reference: number,
) => {
  let review = await findByTypeAndData(
    REVIEW_TYPE,
    data_reference,
  );

  if (review) {
    review.delete();
  }
};

import {
  create,
  DataType,
  findByTypeAndData,
} from "../models/users/data_review.ts";

const REVIEW_TYPE = DataType.EXPERIENCIA_PROYECTO;

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

  //Enviar correo
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

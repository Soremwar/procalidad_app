import {
  DataType,
  create,
  findByTypeAndData,
} from "../models/users/data_review.ts";

const REVIEW_TYPE = DataType.DATOS_IDENTIFICACION;

export const getReview = (
  data_reference: number,
) => {
  return findByTypeAndData(
    REVIEW_TYPE,
    data_reference,
  );
};

export const requestReview = async (
  data_reference: number,
) => {
  let review = await findByTypeAndData(
    REVIEW_TYPE,
    data_reference,
  );

  if(review){
    await review.requestReview();
  }else{
    review = await create(
      REVIEW_TYPE,
      data_reference,
    );
  }

  //Enviar correo
};

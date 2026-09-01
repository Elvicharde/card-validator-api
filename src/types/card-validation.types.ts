export type ApiSuccessResponse<T> = {
  status: "success";
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  status: "failure";
  message: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type CardValidationResponse = {
  isValid: boolean;
};

export type CardValidationApiResponse = ApiResponse<CardValidationResponse>;

export type ImageUploadKind =
  | "category"
  | "product"
  | "avatar"
  | "business-logo";

export interface UploadContext {
  businessId: string;
  userId: string;
}

export interface UploadImageOptions {
  kind: ImageUploadKind;
  entityId: string;
  file: File;
  previousUrl?: string | null;
}

export interface UploadImageResult {
  url: string;
}

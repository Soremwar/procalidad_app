import { TemplateFile } from "../../../../api/models/files/template_file.ts";
import { getReview } from "../../../../api/reviews/user_documents.ts";

class SupportFile {
  constructor(
    public readonly template: number,
    public readonly user: number,
    public readonly name: string,
    public readonly upload_date: Date,
    public approved: boolean | null,
    public observations: string | null,
  ) {}

  async updateApprovalState() {
    // const review = await getReview(`${this.user}_${this.template}`);

    // this.approved = !!review?.approved;
    // this.observations = review?.comments || null;
    this.approved = false;
    this.observations = null;
  }
}

export const templateFileToSupportFile = async (files: TemplateFile[]) => {
  const support_files = files.map((files) =>
    new SupportFile(
      files.template,
      files.user,
      files.name,
      files.upload_date,
      null,
      null,
    )
  );

  const updates = support_files.map((x) => {
    return x.updateApprovalState();
  });

  await Promise.all(updates);

  return support_files;
};

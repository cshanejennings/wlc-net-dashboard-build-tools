import { InsertAPIInputs, ManifestFile } from "manifest/manifest-types";

declare const manifest: {
  variables: InsertAPIInputs;
  files: ManifestFile[];
};

export default manifest;
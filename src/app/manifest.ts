import type { MetadataRoute } from "next";
import { buildManifest } from "@/app/_manifest";

export default function manifest(): MetadataRoute.Manifest {
  return buildManifest() as MetadataRoute.Manifest;
}

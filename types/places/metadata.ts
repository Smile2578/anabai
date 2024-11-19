import { Status } from "../common";

// types/places/metadata.ts
export interface PlaceMetadata {
    source: string;
    placeId?: string;
    lastEnriched?: Date;
    lastVerified?: Date;
    verifiedBy?: string;
    status: Status;
    tags?: string[];
    businessStatus?: string;
    rating?: number;
    ratingCount?: number;
    userRatingsTotal?: number;
  }
  
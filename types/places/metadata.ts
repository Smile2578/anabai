// types/places/metadata.ts

import { Status } from "../common";
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
  
package com.yakupProje.services;

import com.yakupProje.dto.DtoRating;
import com.yakupProje.dto.DtoRatingIU;
import com.yakupProje.entity.Rating;

import java.util.List;

public interface IRatingService {
    DtoRating saveRating(DtoRatingIU dtoRatingIU);
    List<DtoRating> getAllRatings();
    DtoRating getRatingById(Long id);
    DtoRating updateRating(Long id, DtoRatingIU dtoRatingIU);
    DtoRating deleteRating(Long id);
    public Rating getRatingEntityById(Long id);
}

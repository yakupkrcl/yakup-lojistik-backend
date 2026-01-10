package com.yakupProje.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yakupProje.dto.DtoRating;
import com.yakupProje.dto.DtoRatingIU;
import com.yakupProje.services.IUserService;
import com.yakupProje.services.RatingService;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "/rest/v1/ratings")
public class RatingController {
	
	@Autowired
	private RatingService ratingService;
	
	@Autowired
    private IUserService userService;
	
	@GetMapping("/average/{userId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long userId) {
        Double avg = userService.getAverageRating(userId);
        return ResponseEntity.ok(avg);
    }
	
	@PostMapping(path = "/save")
	public DtoRating saveRating(@RequestBody DtoRatingIU dtoRatingIU) {
		return ratingService.saveRating(dtoRatingIU);
	}

	@GetMapping(path = "/list")
	public List<DtoRating> getAllRating() {
		return ratingService.getAllRatings();
	}
	
	@GetMapping(path = "/{id}")
	public ResponseEntity<?> getRatingById(@PathVariable Long id){
	    try {
	        return ResponseEntity.ok(ratingService.getRatingById(id));
	    } catch (Exception e) {
	        // Eğer ID bulunamazsa 500 fırlatmak yerine boş bir nesne dön
	        return ResponseEntity.ok(new DtoRating());
	    }
	}
	
	@PutMapping(path = "/{id}")
	public DtoRating updateRatting(@PathVariable Long id,@RequestBody DtoRatingIU dtoRatingIU){
		return ratingService.updateRating(id, dtoRatingIU)
			;
	}
	
	@DeleteMapping(path = "/{id}")
	public DtoRating deleteRating(@PathVariable Long id){
		return ratingService.getRatingById(id)
				;
	}
}

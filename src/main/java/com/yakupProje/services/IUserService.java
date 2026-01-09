package com.yakupProje.services;

import java.util.List;
import java.util.Optional;

import com.yakupProje.dto.DtoJwtResponse;
import com.yakupProje.dto.DtoLoginRequest;
import com.yakupProje.dto.DtoUsers;
import com.yakupProje.dto.DtoUsersIU;
import com.yakupProje.entity.User;

public interface IUserService {

	DtoUsers saveDtoUsers(DtoUsersIU dtoUsersIU);

	public DtoJwtResponse login(DtoLoginRequest dto);

	public List<DtoUsers> getDtoUserList();

	public Optional<DtoUsers> updateOptional(Long id, DtoUsersIU dtoUsersIU);

	public Optional<DtoUsers> deleUsers(Long id);

	public DtoUsers findById(Long id);

	public Optional<User> findUserByUsername(String email);

	public User getUserEntityById(Long id);
	User getUserEntityByEmail(String email);
	public void saveUserEntity(User user);
	Double getAverageRating(Long userId);
}

package com.industriamem.service;

import com.industriamem.entity.User;
import com.industriamem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("userService")
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User loadByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User get(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
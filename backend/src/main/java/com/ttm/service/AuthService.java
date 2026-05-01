package com.ttm.service;

import com.ttm.dto.AuthDto;
import com.ttm.dto.UserResponse;
import com.ttm.model.User;
import com.ttm.repository.UserRepository;
import com.ttm.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    private static final List<String> AVATAR_COLORS = Arrays.asList(
            "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
            "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6");

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthDto.AuthResponse signup(AuthDto.SignupRequest request) {
        String email = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAvatarColor(AVATAR_COLORS.get(new Random().nextInt(AVATAR_COLORS.size())));

        long userCount = userRepository.count();
        if (userCount == 0 || "ADMIN".equalsIgnoreCase(request.getRole())) {
            user.setRole(User.Role.ADMIN);
        } else {
            user.setRole(User.Role.MEMBER);
        }

        User saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved.getEmail(), saved.getId(), saved.getRole().name());
        return new AuthDto.AuthResponse(token, UserResponse.from(saved));
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthDto.AuthResponse(token, UserResponse.from(user));
    }
}

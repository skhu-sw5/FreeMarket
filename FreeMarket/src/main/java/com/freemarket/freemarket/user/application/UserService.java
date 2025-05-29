package com.freemarket.freemarket.user.application;

import com.freemarket.freemarket.product.domain.ProductStatus;
import com.freemarket.freemarket.product.domain.repository.ProductRepository;
import com.freemarket.freemarket.user.api.dto.UserDto;
import com.freemarket.freemarket.user.domain.User;
import com.freemarket.freemarket.user.domain.repository.UserRepository;
import com.freemarket.freemarket.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final ProductRepository productRepository;

    public UserDto.UserResponse getUserProfile(Long userId) {
        User user = getUser(userId);

        // 통계 정보 조회
        long activeProductCount = productRepository.countBySellerIdAndStatus(userId, ProductStatus.ACTIVE);
        long soldProductCount = productRepository.countBySellerIdAndStatus(userId, ProductStatus.SOLD_OUT);
        long purchaseCount = productRepository.countByBuyerId(userId);


        return UserDto.UserResponse.from(
                user,
                (int) activeProductCount,
                (int) soldProductCount,
                (int) purchaseCount);
    }


    @Transactional
    public UserDto.UserResponse updateProfile(Long userId, UserDto.ProfileUpdateRequest request) {
        User user = getUser(userId);
        user.updateProfile(request.name(), request.phone());

        log.info("사용자 프로필 업데이트 완료: {}", userId);

        long activeProductCount = productRepository.countBySellerIdAndStatus(userId, ProductStatus.ACTIVE);
        long soldProductCount = productRepository.countBySellerIdAndStatus(userId, ProductStatus.SOLD_OUT);
        long purchaseCount = productRepository.countByBuyerId(userId);

        return UserDto.UserResponse.from(
                user,
                (int) activeProductCount,
                (int) soldProductCount,
                (int) purchaseCount);
    }

    @Transactional
    public void changePassword(Long userId, UserDto.PasswordChangeRequest request) {
        User user = getUser(userId);

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new UserException.PasswordMismatchException();
        }

        // 새 비밀번호가 현재 비밀번호와 동일한지 확인
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new UserException.PasswordSameAsOldException();
        }

        // 비밀번호 변경
        user.changePassword(passwordEncoder.encode(request.newPassword()));
        log.info("사용자 비밀번호 변경 완료: {}", userId);
    }

    // 판매자 기본 정보 조회
    public UserDto.SellerDetailResponse getSellerInfo(Long sellerId) {
        User seller = getUser(sellerId);

        int activeCount = (int) productRepository.countBySellerIdAndStatus(sellerId, ProductStatus.ACTIVE);
        int soldCount = (int) productRepository.countBySellerIdAndStatus(sellerId, ProductStatus.SOLD_OUT);

        return UserDto.SellerDetailResponse.from(seller, activeCount, soldCount);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException.UserNotFoundException(userId));
    }
}

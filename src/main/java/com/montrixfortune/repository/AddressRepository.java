package com.montrixfortune.repository;

import com.montrixfortune.entity.Address;
import com.montrixfortune.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    List<Address> findByUser(User user);
}

package com.montrixfortune.serviceImpl;

import com.montrixfortune.dto.address.AddressRequest;
import com.montrixfortune.entity.Address;
import com.montrixfortune.entity.User;
import com.montrixfortune.exception.AddressNotFoundException;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.AddressRepository;
import com.montrixfortune.repository.UserRepository;
import com.montrixfortune.service.AddressService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(){

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public Address addAddress(AddressRequest request) {

        User user = getCurrentUser();

        Address address = new Address();

        address.setFullName(request.getName());
        address.setPhoneNumber(request.getPhone());
        address.setStreetAddress(request.getHouseNo() + " " + request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getZipCode());
        address.setCountry(request.getCountry());
        address.setUser(user);

        return addressRepository.save(address);
    }

    @Override
    public List<Address> getUserAddresses() {

        User user = getCurrentUser();

        return addressRepository.findByUser(user);
    }

    @Override
    public Address updateAddress(Long addressId, AddressRequest request) {

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(getCurrentUser().getId())) {
            throw new AddressNotFoundException("Address not found");
        }

        address.setFullName(request.getName());
        address.setPhoneNumber(request.getPhone());
        address.setStreetAddress(request.getHouseNo() + " " + request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getZipCode());
        address.setCountry(request.getCountry());

        return addressRepository.save(address);
    }

    @Override
    public void deleteAddress(Long addressId) {

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(getCurrentUser().getId())) {
            throw new AddressNotFoundException("Address not found");
        }

        addressRepository.delete(address);
    }
}
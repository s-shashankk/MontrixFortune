package com.montrixfortune.service;

import com.montrixfortune.dto.address.AddressRequest;
import com.montrixfortune.entity.Address;

import java.util.List;

public interface AddressService {

    Address addAddress(AddressRequest request);

    List<Address> getUserAddresses();

    Address updateAddress(Long addressId, AddressRequest request);

    void deleteAddress(Long addressId);
}
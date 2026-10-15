package com.montrixfortune.controller;

import com.montrixfortune.dto.address.AddressRequest;
import com.montrixfortune.entity.Address;
import com.montrixfortune.service.AddressService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public Address addAddress(@Valid @RequestBody AddressRequest request){

        return addressService.addAddress(request);
    }

    @GetMapping
    public List<Address> getAddresses(){

        return addressService.getUserAddresses();
    }

    @PutMapping("/{id}")
    public Address updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request){

        return addressService.updateAddress(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable Long id){

        addressService.deleteAddress(id);
    }
}
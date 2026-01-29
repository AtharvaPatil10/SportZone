package com.sportzone.payment.controller;

import com.razorpay.RazorpayException;
import com.sportzone.payment.entity.Payment;
import com.sportzone.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestParam Long bookingId, @RequestParam Double amount) {
        try {
            Payment payment = paymentService.createOrder(bookingId, amount);
            return ResponseEntity.ok(payment);
        } catch (RazorpayException e) {
            return ResponseEntity.internalServerError().body("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @PostMapping("/update-status")
    public ResponseEntity<Payment> updateStatus(@RequestBody Payment paymentDetails) {
        return ResponseEntity.ok(paymentService.updatePayment(
                paymentDetails.getRazorpayOrderId(),
                paymentDetails.getRazorpayPaymentId(),
                paymentDetails.getRazorpaySignature(),
                paymentDetails.getStatus()
        ));
    }
}

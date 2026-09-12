
pragma circom 2.0.0;
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/gates.circom";

template ThresholdVerification(n) {
    signal input actualAmount;
    signal input threshold;
    signal output isValid;
    
    component lt = LessThan(n);
    lt.in[0] <== actualAmount;
    lt.in[1] <== threshold;
    
    component not_gate = NOT();
    not_gate.in <== lt.out;
    isValid <== not_gate.out;
}

component main { public [threshold] } = ThresholdVerification(64);

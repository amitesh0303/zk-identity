declare module "snarkjs" {
  export const groth16: {
    fullProve(
      input: Record<string, unknown>,
      wasmPath: string,
      zkeyPath: string
    ): Promise<{ proof: Groth16Proof; publicSignals: string[] }>;
    verify(
      vKey: unknown,
      publicSignals: string[],
      proof: Groth16Proof
    ): Promise<boolean>;
    exportSolidityCallData(
      publicSignals: string[],
      proof: Groth16Proof
    ): Promise<string>;
  };

  export interface Groth16Proof {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  }
}

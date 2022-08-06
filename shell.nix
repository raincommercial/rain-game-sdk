let
  pkgs = import
    (builtins.fetchTarball {
      name = "nixos-unstable-2021-10-01";
      url = "https://github.com/nixos/nixpkgs/archive/0f33d439a715688605402a450fba0382b658d581.tar.gz";
      sha256 = "1nfz3z8dx5rbs6y6w35rrhbxb9sw70zkc5mr7g5k5rx3mqg5wp1x";
    })
    { };

 generate-docs = pkgs.writeShellScriptBin "generate-docs" ''
  yarn generate-docs
 '';

 lint-sdk = pkgs.writeShellScriptBin "lint-sdk" ''
  yarn lint
 '';

 build-sdk = pkgs.writeShellScriptBin "build-sdk" ''
  copy-typechain
  yarn build
 '';

 test-sdk = pkgs.writeShellScriptBin "test-sdk" ''
  yarn build
  yarn test
 '';

 copy-contracts = pkgs.writeShellScriptBin "copy-contracts" ''
  mkdir -p contracts && cp -r node_modules/@beehiveinnovation/rain1155/contracts .
    hardhat compile --no-typechain
 '';

 generate-typechain = pkgs.writeShellScriptBin "generate-typechain" ''
  hardhat typechain 
  rm -rf src/typechain && mkdir -p src/typechain
  cp -r typechain src
 '';

 copy-typechain = pkgs.writeShellScriptBin "copy-typechain" ''
  copy-contracts
  generate-typechain
 '';

in
pkgs.stdenv.mkDerivation {
 name = "shell";
 buildInputs = [
  pkgs.yarn
  pkgs.nodejs-14_x
  copy-contracts
  generate-typechain
  copy-typechain
  generate-docs
  lint-sdk
  build-sdk
  test-sdk
 ];

 shellHook = ''
  export PATH=$( npm bin ):$PATH
  # keep it fresh
  yarn install --ignore-scripts
 '';
}

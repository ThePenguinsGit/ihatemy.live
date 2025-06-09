{
  description = "Schulungsportal dev shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
  };

  outputs = {nixpkgs, ...}: let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
  in {
    devShells.${system} = {

      default = pkgs.mkShell {
        packages = [
          pkgs.nodejs_24
          pkgs.nodePackages.pnpm
        ];
        shellHook = ''
          node --version
        '';
      };
    };
  };
}
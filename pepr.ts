import { PeprModule } from "pepr";
// cfg loads your pepr configuration from package.json
import cfg from "./package.json";

// HelloPepr is a demo capability that is included with Pepr. Comment or delete the line below to remove it.
// import { HelloPepr } from "./capabilities/hello-pepr";
import {AdmissionCapability} from "./capabilities/admission"

/**
 * This is the main entrypoint for this Pepr module. It is run when the module is started.
 * This is where you register your Pepr configurations and capabilities.
 */
new PeprModule(cfg, [
  AdmissionCapability,
]);

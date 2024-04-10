import {
  Capability,
  Log,
  a,
  sdk,
} from "pepr";
const { containers } = sdk;


/**
 *  The HelloPepr Capability is an example capability to demonstrate some general concepts of Pepr.
 *  To test this capability you run `pepr dev`and then run the following command:
 *  `kubectl apply -f capabilities/hello-pepr.samples.yaml`
*/
export const AdmissionCapability = new Capability({
  name: "admission",
  description: "disallow root at least",
  namespaces: [],
});

// Use the 'When' function to create a new action, use 'Store' to persist data
const { When, Store, OnSchedule } = AdmissionCapability;
// const transformedUser = 655532
const lastIgnoreMe = "last-ignore-me"

OnSchedule({
  name: "hello-interval",
  every: 30,
  unit: "seconds",
  run: async () => {
    const lastIgnoredPod = Store.getItem(lastIgnoreMe)
    Log.info("last ingored pod was", lastIgnoredPod)
    Store.setItem("pass", lastIgnoredPod)
  },
});


// Why are there some examples of async mutate and some are not? 
When(a.Pod)
  .IsCreatedOrUpdated()
  .InNamespace("phase-2")
  .Validate(pod => {
    
    const container = containers(pod)
    for (let index = 0; index < container.length; index++) {
      if (container[index].securityContext.privileged || container[index].securityContext.allowPrivilegeEscalation) {
        return pod.Deny("pods can't be root");
      }
    }

    return pod.Approve()
  })

When(a.Pod)
  .IsCreatedOrUpdated()
  .Mutate(pod => {
    if (pod.HasLabel("ignore-me")) {
      Store.setItem(lastIgnoreMe, pod.Raw.metadata.name);
      return
    }

    if (!pod.Raw.spec.securityContext) {
      pod.Raw.spec.securityContext = {};
    }
    if (pod.Raw.spec.securityContext.runAsUser == undefined) {
      pod.Raw.spec.securityContext.runAsUser = 65532
    } else {
      if (pod.Raw.spec.securityContext.runAsUser <= 10) {
        pod.Raw.spec.securityContext.runAsUser = 1000
      }
    }

    const containerList = containers(pod)
    containerList.forEach(container => {
      if (!container.securityContext) {
        container.securityContext = {}
      }
      if (container.securityContext.runAsUser == undefined) {
        container.securityContext.runAsUser = 65532
      } else {
        if (container.securityContext.runAsUser <= 10) {
          container.securityContext.runAsUser = 1000
        }
      }
    });

  })
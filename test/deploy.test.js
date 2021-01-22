"use strict";

const chai = require("chai");
const humpback = require("../lib/humpback-deploy.js");
const http = require("http");

describe("lib", function () {
  let mockServer;

  before(() => {
    mockServer = http.createServer((request, response) => {
      response.write(
        JSON.stringify(request.url.includes('tags/list')?{
          name: "xxxx", tags: ["latest", "v1.0", "v2.0", "v2.9", "v2.10", "v2.191"]
        }:{
          Data:{
            Containers:[]
          }
         })
      );
      response.end();
    });
    mockServer.listen(8589);
  });

  after(() => {
    mockServer.close();
  });

  it("deploy add latest version", async function () {
    await humpback.deploy(
      "http://localhost:8589/v1",
      {
        GroupId: "153792ac-d72c-45c9-b6a7-86231757c444",
        Instances: 1,
        Config: {
          Name: "update",
          Image: "localhost:8589/xxxxx",
          Ports: [
            {
              PrivatePort: 80,
              PublicPort: 12800,
              Type: "tcp",
            },
          ],
          Env: [
          ],
          NetworkMode: "bridge",
          RestartPolicy: "always",
        },
      },
      true,
      {
        comment: console.log,
      }
    );
  });
});

// 部署到集群容器
const axios = require("axios");

exports.deploy = async function deploy(url, config, addVersion, context) {
  context.comment("hupback url " + (url || process.env.HUMPBACK_URL));
  const humpapi = axios.create({
    baseURL: url || process.env.HUMPBACK_URL,
  });
  context.comment("find meta " + config.Config.Name);
  // 查询是否已经存在
  const findRes = await humpapi.get(
    "/groups/" + config.GroupId + "/collections"
  );
  if (findRes.data.Code) {
    throw new Error(findRes.data.Error);
  }
  const meta = findRes.data.Data.Containers.find(
    (it) => it.Config.Name === config.Config.Name
  );
  let version = "latest";
  if (addVersion) {
    const urls = config.Config.Image.split("/");
    const name = urls
      .slice(1, urls.length - 1)
      .concat(urls[urls.length - 1].split(":")[0])
      .join("/");
    const remote = `http://${urls[0]}/v2/${name}/tags/list`;
    context.comment(`fetch: ${remote}`);
    const res = await axios.get(remote);
    version =
      res.data.tags
        .sort()
        .reverse()
        .find((v) => {
          return v !== "latest";
        }) || "latest";
    context.comment(`tag: ${version}`);
    config.Image = urls[0] + "/" + name + ":" + version;
  } else {
    version = config.Image.split("/").pop().split(":")[1] || "latest";
  }
  let res;
  if (!meta) {
    // 要是不存在创建
    context.comment("create meta " + JSON.stringify(config));
    res = await humpapi.post("/groups/collections", config);
    if (res.data.Code) {
      throw new Error(res.data.Error);
    }
  } else {
    // 要是存在执行升级
    context.comment("update meta" + meta.MetaId + " " + version);
    res = await humpapi.put("/groups/collections/upgrade", {
      MetaId: meta.MetaId,
      ImageTag: version,
    });
    if (res.data.Code) {
      throw new Error(res.data.Error);
    }
  }

  // 显示容器状态
  context.comment(
    res.data.Data.Containers.map(
      (it) => it.Name + " is " + it.Status.Status
    ).join(" ")
  );
};

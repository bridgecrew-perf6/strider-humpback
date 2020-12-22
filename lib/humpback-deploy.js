// 部署到集群容器

exports.deploy = async function deploy(url, config, context) {
  context.comment("hupback url " + (url || process.env.HUMPBACK_URL));
  const axios = require("axios").create({
    baseURL: url || process.env.HUMPBACK_URL,
  });
  context.comment("find meta " + config.Config.Name);
  // 查询是否已经存在
  const findRes = await axios.get("/groups/" + config.GroupId + "/collections");
  if (findRes.data.Code) {
    throw new Error(findRes.data.Error);
  }
  const meta = findRes.data.Data.Containers.find(
    (it) => it.Config.Name === config.Config.Name
  );
  let res;
  if (!meta) {
    // 要是不存在创建
    context.comment("create meta " + JSON.stringify(config));
    res = await axios.post("/groups/collections", config);
    if (res.data.Code) {
      throw new Error(res.data.Error);
    }
  } else {
    // 要是存在执行升级
    context.comment("update meta" + meta.MetaId + " latest");
    res = await axios.put("/groups/collections/upgrade", {
      MetaId: meta.MetaId,
      ImageTag: "latest",
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

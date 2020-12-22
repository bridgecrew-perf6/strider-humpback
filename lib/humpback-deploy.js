
// 部署到集群容器
const debug = require('debug')('strider-humpback:humpback-deploy');
const axios = require('axios').create({
  baseURL: process.env.HUMPBACK_URL,
});

exports.deploy = async function deploy(config) {
  debug('find meta', config.Config.Name);
  // 查询是否已经存在
  const findRes = await axios.get('/groups/' + config.GroupId + '/collections');
  if (findRes.data.Code) {
    throw new Error(findRes.data.Error);
  }
  const meta = findRes.data.Data.Containers.find(
    (it) => it.Config.Name === config.Config.Name
  );
  let res;
  if (!meta) {
    // 要是不存在创建
    debug('create meta', config);
    res = await axios.post('/groups/collections', config);
    if (res.data.Code) {
      throw new Error(res.data.Error);
    }
  } else {
    // 要是存在执行升级
    debug('update meta', meta.MetaId, 'latest');
    res = await axios.put('/groups/collections/upgrade', {
      MetaId: meta.MetaId,
      ImageTag: 'latest',
    });
    if (res.data.Code) {
      throw new Error(res.data.Error);
    }
  }

  // 显示容器状态
  debug(
    ...res.data.Data.Containers.map((it) => it.Name + ' is ' + it.Status.Status)
  );
}


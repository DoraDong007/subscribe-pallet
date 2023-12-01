import { ApiPromise, WsProvider } from '@polkadot/api';
import '@polkadot/api-augment';
import { u32 } from '@polkadot/types';

const WEB_SOCKET = 'ws://127.0.0.1:9944';

const connect = async () => {
  const wsProvider = new WsProvider(WEB_SOCKET);
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  return api;
};

const subscribeToValueAndEvent = async (api: ApiPromise) => {
  // 订阅template pallet中的something值的更新
  await api.query.templateModule.something((newValue: u32) => {
    console.log(`[Value Update] Something's new value: `, newValue.toString());
  });

  // 监听并输出SomethingStored事件
  await api.query.system.events((events) => {
    events.forEach((record) => {
      const { event } = record;
      if (event.section === 'templateModule' && event.method === 'SomethingStored') {
        console.log(`[Event] SomethingStored: `, event.data.toString());
      }
    });
  });
};

const main = async () => {
  const api = await connect();
  await subscribeToValueAndEvent(api);

  // 程序将持续运行并监听更新和事件，直到手动停止或发生错误
};

main()
  .then(() => {
    console.log('Program is running...');
  })
  .catch((err) => {
    console.error('An error occurred:', err);
  });
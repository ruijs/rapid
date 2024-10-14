import { Spin } from "antd";
import { memo, PropsWithChildren, Suspense, useEffect, useState } from "react";

const ClientOnly = memo<PropsWithChildren>((props) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{props.children}</> : <></>;
});

export default ClientOnly;

export const ClientOnlySuspense = memo<PropsWithChildren>((props) => {
  return (
    <ClientOnly>
      <Suspense fallback={<Spin />}>{props.children}</Suspense>
    </ClientOnly>
  );
});

import { createFieldConfig, FormFields, useStoreRef } from "./store/form";
import React from "react";

enum FIELDS {
  userName = "userName",
  email = "email",
  password = "password"
}

export default function Home() {
  const { getStore } = useStoreRef();
  return (
    <div>
      <FormFields
        getStore={getStore}
        configs={() => {
          return {
            [FIELDS.userName]: createFieldConfig({
              label: "用户名",
              get defaultValue() {
                return 2;
              },
              editor() {
                return <input></input>;
              }
            }),
            [FIELDS.password]: createFieldConfig({
              label: "密码",
              get defaultValue() {
                return 2;
              }
            }),
            [FIELDS.email]: createFieldConfig({
              label: "电子邮件",
              get defaultValue() {
                return 2;
              }
            })
          };
        }}
      ></FormFields>
    </div>
  );
}

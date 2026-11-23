"use client";

import { useId } from "react";
import { Avatar, Button, Dropdown } from "@digdir/designsystemet-react";
import { logOut } from "@/app/_components/actions";

// Avatar and first name; the menu holds Log out only for now (Settings and Action log come later).
export function AccountMenu({ firstName, logoutLabel }: { firstName: string; logoutLabel: string }) {
  const menuId = useId();
  return (
    <>
      <Button className="account-trigger" variant="tertiary" data-size="sm" popoverTarget={menuId}>
        <Avatar aria-hidden="true" data-size="xs">
          {firstName.charAt(0).toUpperCase()}
        </Avatar>
        <span className="account-name">{firstName}</span>
      </Button>
      <Dropdown id={menuId} data-size="sm" placement="bottom-end">
        <Dropdown.List>
          <Dropdown.Item>
            <form action={logOut}>
              <Dropdown.Button type="submit">{logoutLabel}</Dropdown.Button>
            </form>
          </Dropdown.Item>
        </Dropdown.List>
      </Dropdown>
    </>
  );
}

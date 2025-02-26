"use client";

import {
    BadgeCheck,
    CreditCard,
    LogOut,
    Sparkles,
    Calendar, 
    Vote,
    User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IUser } from "@/interfaces/interfaces";
import { Link } from "react-router-dom";

interface User extends IUser {
    isGuest: boolean
}

interface NavUserProps {
    user: User;
    logout: () => void;
}
export function NavUser({ user, logout }: NavUserProps) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                    <span className="truncate font-semibold">
                        {user.isGuest ? user.firstName : `${user.firstName} ${user.lastName}`}
                    </span>
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback className="rounded-lg">
                            <User />
                        </AvatarFallback>
                    </Avatar>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">

                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback className="rounded-lg">
                                <User />
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{user.firstName} {user.isGuest ? "" : user.lastName}</span>
                            <span className="truncate text-xs">{user.isGuest ? "" : user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                {
                    !user.isGuest && (
                        <>
                        <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="opacity-50 cursor-not-allowed">
                                    <Sparkles />
                                    Upgrade to Pro
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <BadgeCheck />
                                    Your Account
                                </DropdownMenuItem>
                                <Link to="/events">
                                <DropdownMenuItem>
                                    <Calendar />
                                    Manage Events
                                </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem>
                                    <Vote className="w-6 h-6"/>
                                    Manage Poll
                                </DropdownMenuItem>
                                <DropdownMenuItem className="opacity-50 cursor-not-allowed">
                                    <CreditCard />
                                    Billing
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </>
                    )
                }
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

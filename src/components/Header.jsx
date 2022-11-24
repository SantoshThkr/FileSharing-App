import React from 'react';
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton, Button, useDisclosure, VStack, HStack
} from '@chakra-ui/react';

import { Link } from "react-router-dom";
import { BiMenuAltLeft } from 'react-icons/bi';

const Header = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>

            <Button pos={"fixed"} zIndex={'overlay'} top={"5"} left={"5"} colorScheme={"purple"} borderRadius={"full"} padding="0" w={"10"} h={"10"} onClick={onOpen}>
                <BiMenuAltLeft />
            </Button>

            <Drawer isOpen={isOpen} onClose={onClose} placement={"left"}>
                <DrawerOverlay />

                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>VideoMania</DrawerHeader>
                        <DrawerBody>
                            <VStack alignItems={"flex-start"}>

                                <Button onClick={onClose} variant={"ghost"} colorScheme={"purple"}>
                                    <Link to={"/"}>Home</Link>
                                </Button>

                                <Button onClick={onClose} variant={"ghost"} colorScheme={"purple"}>
                                    <Link to={"/videos"}>Videos</Link>
                                </Button>

                                <Button onClick={onClose} variant={"ghost"} colorScheme={"purple"}>
                                    <Link to={"/videos?category=free"}>Free Videos</Link>
                                </Button>

                                <Button onClick={onClose} variant={"ghost"} colorScheme={"purple"}>
                                    <Link to={"/upload"}>Upload Videos</Link>
                                </Button>

                            </VStack>

                            <HStack pos={"absolute"} bottom={"10"} justifyContent={"space-evenly"} w={"full"}>
                                <Button onClick={onClose} colorScheme={"purple"} >
                                    <Link to={"/login"}>Log In</Link>
                                </Button>

                                <Button onClick={onClose}>
                                    <Link to={"/signup"}>Signup</Link>
                                </Button>
                            </HStack>
                        </DrawerBody>
                </DrawerContent>
            </Drawer>




        </>
    )
}

export default Header
import { Box, Container, Heading, Img, Stack } from '@chakra-ui/react';
import React from 'react';
import {Carousel} from 'react-responsive-carousel';

import 'react-responsive-carousel/lib/styles/carousel.min.css';

import img1 from "../assets/1.jpeg";
import img2 from "../assets/2.jpeg";
import img3 from "../assets/3.jpeg";
import img4 from "../assets/4.jpeg";
import img5 from "../assets/5.png";


const HeadingOptions = {
    pos:"absolute",
    left: '50%',
    top: '50%',
    transform : 'translate(-50%,-50%)',
    textTransform : 'Uppercase',
    p: '4',
    size: "4xl"

};


const Home = () => {
  return (
    <Box>
        <MyCarousel />

        <Container maxW={"container.xl"} minH={"100vh"} p={'16'}>
            <Heading textTransform={'uppercase'} w={'fit-content'} py={'2'} borderBottom={'2px solid'} m={'auto'}>Services</Heading>

        <Stack>
            
        </Stack>
        </Container>
    </Box>
  )
}

const MyCarousel = () => (
    <Carousel infiniteLoop autoPlay interval={2000}>
        <Box w={'full'} h={"100vh"}>
            <Img src={img1} alt="Item1" />
            <Heading bg={'blackAlpha.600'} color={'white'} {...HeadingOptions}>Future Ai Model</Heading>
        </Box>

        <Box w={'full'} h={"100vh"}>
            <Img src={img2} alt="Item2" />
            <Heading bg={'blackAlpha.600'} color={'white'} {...HeadingOptions}>Future Ai Model</Heading>
        </Box>

        <Box w={'full'} h={"100vh"}>
            <Img src={img3} alt="Item3" />
            <Heading bg={'blackAlpha.600'} color={'white'} {...HeadingOptions} >Future Ai Model</Heading>
        </Box>

        <Box w={'full'} h={"100vh"}>
            <Img src={img4} alt="Item4" />
            <Heading bg={'blackAlpha.600'} color={'white'} {...HeadingOptions} >Future Ai Model</Heading>
        </Box>
    </Carousel>
)

export default Home
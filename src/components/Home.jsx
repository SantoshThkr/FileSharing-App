import { Box, Container, Heading, Img, Stack , Text} from '@chakra-ui/react';
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

        <Stack
        h="full"
        p={"4"}
        alignItems={'center'}
        direction={['column', 'row']}
        >

            <Img src={img5} h={[40 , 400]} filter={'hue-rotate(-130deg)'} />

            <Text letterSpacing={'widest'} lineHeight={'190%'} p={['2','10']}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit saepe magnam, quas error enim dignissimos mollitia est cupiditate incidunt minima consectetur distinctio dolore optio iure molestias iusto inventore aliquam quibusdam. Officia animi facere, laborum modi ducimus, laboriosam accusamus voluptate omnis eum soluta facilis hic. Vitae corporis iusto accusantium tenetur nobis asperiores reprehenderit labore magni, expedita omnis, quam ducimus adipisci possimus suscipit laudantium sunt! Laudantium quidem repellat consequatur, facere fugit, ab asperiores blanditiis doloremque ex vitae officia et consequuntur iure optio obcaecati. Aperiam ut labore quo nulla dolore et? Doloribus temporibus debitis, vitae unde hic magni rerum modi praesentium laudantium a iste minima! Nesciunt, fuga odio? Deserunt eveniet perspiciatis explicabo aliquid iste possimus nam nisi dignissimos officia voluptate fugiat doloribus rem unde, non odio. Nulla tenetur totam ipsum saepe. A perspiciatis placeat deleniti nostrum, similique autem quia vero amet doloribus, praesentium vitae facere esse ducimus voluptatibus, iure quod distinctio corrupti eaque.
            </Text>

            
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
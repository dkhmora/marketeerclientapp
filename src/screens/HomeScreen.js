import React from 'react';
import {
  Text,
  Container,
  Content,
  Header,
  Body,
  Right,
  Left,
  Button,
} from 'native-base';

export const HomeScreen = () => {
  return (
    <Container style={{flex: 1}}>
      <Header>
        <Left />
        <Body>
          <Text>Home Screen</Text>
        </Body>
        <Right />
      </Header>

      <Content>
        <Text style={{textAlign: 'center'}}>Hello World</Text>
        <Button rounded style={{flex: 1}}>
          <Text>Testing</Text>
        </Button>
      </Content>
    </Container>
  );
};

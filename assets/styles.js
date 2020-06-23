import {StyleSheet, Platform} from 'react-native';
import {colors} from './colors';
import {StatusBar} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  footer: {
    flex: Platform.OS === 'ios' ? 5 : 7,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  text_header: {
    color: colors.text_primary,
    fontWeight: 'normal',
    fontSize: 30,
    paddingBottom: 30,
    paddingTop: 10,
  },
  text_subtext: {
    color: colors.text_secondary,
    textAlign: 'left',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  text_footer: {
    color: colors.text_primary,
    fontSize: 18,
  },
  text_flatListTitle: {
    fontSize: 30,
    fontFamily: 'ProductSans-Bold',
  },
  touchable_text: {
    fontFamily: 'ProductSans-Bold',
    color: colors.primary,
    marginTop: 1,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: colors.primary,
    fontFamily: 'ProductSans-Bold',
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  color_textPrivate: {
    color: '#333',
  },
  icon_container: {
    flexDirection: 'row',
    marginTop: 2,
  },
});

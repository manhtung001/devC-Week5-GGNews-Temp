import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Image, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Button } from 'react-native-elements';
import { Icon } from 'react-native-elements';

const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};

const App = () => {

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [lastPageReached, setLastPageReached] = useState(false);
  const [individualPublishers, setIndividualPublishers] = useState([]);

  const toTest = () => {

    console.log(individualPublishers)
  }

  const getNews = async () => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=b4ab0e1b23b5496caca739c1da8394ff&page=${pageNumber}`
      );
      const jsonData = await response.json();
      if (jsonData.articles.length > 0) {
        const newArticleList = filterForUniqueArticles(
          articles.concat(jsonData.articles)
        );
        setArticles(newArticleList);
        setPageNumber(pageNumber + 1);

        let newindividualPublishers = individualPublishers;
        newArticleList.forEach(item => {
          let isOnly = true;
          individualPublishers.forEach(publisher => {
            if (item.source.name === publisher) {
              isOnly = false;
            }
          })
          if (isOnly) {
            newindividualPublishers.push(item.source.name);
          }
        })
        console.log(newindividualPublishers.length)

        setIndividualPublishers(newindividualPublishers);

      } else {
        setLastPageReached(true);
      }

    } catch (error) {
      console.log(err);
    }
    setLoading(false);
  };


  useEffect((() => {
    getNews();
  }), []);

  const openLink = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };

  const renderArticleItem = ({ item }) => {
    if (articles.length > 1) {
      const startTime = moment(item.publishedAt)
      const now = moment()
      moment(startTime).format("m[m] s[s]")
      const duration = moment.duration(now.diff(startTime));
      const hours = duration.asHours();
      const hour = Math.floor(hours);
      let minute2 = Math.floor((((Math.round(hours * 100) / 100) - hour)) * 60) + 1;
      minute2.toString();
      let minute = minute2 > 9 ? minute2 : `0${minute2}`;
      return (
        <Card>
          <Text style={styles.info2}>{hour < 1 ? `${minute} minutes ago` : `${hour} hours ${minute} minutes ago`}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Image style={styles.imgTitle} source={{ uri: item.urlToImage }} />
          <View style={styles.row}>
            <Text style={styles.label}>Source</Text>
            <Text style={styles.info}>{item.source.name}</Text>
          </View>
          <Text style={{ marginBottom: 10 }}>{item.content}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Published</Text>
            <Text style={styles.info}>
              {moment(item.publishedAt).format('LLL')}
            </Text>
          </View>
          <Button onPress={() => openLink(item.url)} icon={<Icon />} title="Read more" backgroundColor="#03A9F4" />
        </Card>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" loading={loading} />
      </View>
    );
  }

  if (!loading) {
    console.log(individualPublishers)
    console.log("x");
    return (
      <View style={styles.container}>

        <View style={styles.row}>
          <Text style={styles.label}>Articles Count:</Text>
          <Text style={styles.info}>{articles.length}</Text>
        </View>

        <View style={styles.wrapper}>
          <Text style={styles.titleHeader}>Publishers: </Text>
          {individualPublishers.map((item, index) => 
              <Text style={styles.textHeader} key={item}>{index+1 === individualPublishers.length ? `${item}.` : `${item}, `}</Text>
            )}
        </View>

        <FlatList
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={item => item.title}
          onEndReached={() => getNews()}
          onEndReachedThreshold={1}
          ListFooterComponent={lastPageReached ? <Text style={styles.titleEnd}>END</Text> : <ActivityIndicator size="large" loading={loading} />}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text>reset</Text>
      </View>
    );
  }
}

export default App;


const styles = StyleSheet.create({
  containerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  header: {
    height: 30,
    width: '100%',
    backgroundColor: 'pink'
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
    fontWeight: 'bold'
  },
  info: {
    fontSize: 16,
    color: 'grey'
  },
  info2: {
    fontSize: 14,
    color: 'grey'
  },
  title: {
    fontSize: 20,
    fontWeight: "600"
  },
  titleEnd: {
    fontSize: 20,
    fontWeight: "600",
    paddingBottom: 20,
    alignSelf: "center"
  },
  imgTitle: {
    width: "100%",
    height: 200
  },
  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  titleHeader: {
    fontSize: 16,
    fontWeight: "600"
  },
  textHeader: {
    fontSize: 16,

  }
});

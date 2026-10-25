import React from 'react';
import {Text} from 'react-native';
import {KPLargeList} from '../src';

// Compile-time only (checked by `yarn typecheck`): item type is inferred from `data`.
type Article = {slug: string; words: number};
declare const articles: Article[];

export const ok = (
  <KPLargeList
    data={articles}
    keyExtractor={a => a.slug}
    renderItem={a => <Text>{a.words}</Text>}
    onItemPress={a => a.slug}
    onItemVisibilityChange={(a, _i, visible) => visible && a.slug}
  />
);

export const bad = (
  <KPLargeList
    data={articles}
    // @ts-expect-error `title` does not exist on Article
    keyExtractor={a => a.title}
    renderItem={() => <Text />}
  />
);

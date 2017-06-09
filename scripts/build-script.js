import _ from 'lodash/fp';
import builtInFeatures from 'babel-preset-env/data/built-in-features';
import builtIns from 'babel-preset-env/data/built-ins';


const collect =
  _.curry((fn, data) => _.flow(_.map(fn), _.filter(_.identity))(data));


function processTypedArray(v) {
  const { features: [x = '', ...rest] = [] } = v;
  const typedArrayName = x.replace(/^typed arrays \/ (.*$)/, '$1');
  if (typedArrayName === x) {
    return v;
  }

  const processed = _.flow(
    _.map(_.replace('%TypedArray%', typedArrayName)),
    _.concat([typedArrayName]),
  )(rest);

  return { features: processed };
}

const res = _.flow(
  _.pickBy(({ ie }) => !ie || ie !== '11'),
  _.keys,
  collect(v => builtInFeatures[v]),
  _.map(processTypedArray),
  _.flatMap(v => v.features || [v]),
  _.map(_.replace(/^.* \/ (.*)$/, '$1')),
  _.reject(_.includes(' ')),
  _.orderBy([_.equals('Symbol'), _.startsWith('Symbol.'), _.identity], ['asc', 'asc', 'desc']),
  _.map(v => (_.includes('.', v) ? `try { delete ${v}; } catch (e) {}\n` : `delete ${v};\n`)),
  _.join(''),
)(builtIns);


console.log(res);

import calendar, importlib.util, pathlib, unittest
spec=importlib.util.spec_from_file_location('climate',pathlib.Path(__file__).parents[1]/'scripts'/'import-climate.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class ClimateTests(unittest.TestCase):
 def fixture(self):
  dates=[f'2024-{m:02d}-{d:02d}' for m in range(1,13) for d in range(1,calendar.monthrange(2024,m)[1]+1)]
  daily={'time':dates,**{field:[value]*len(dates) for field,value in [('temperature_2m_mean',20),('temperature_2m_min',15),('temperature_2m_max',25),('precipitation_sum',2),('sunshine_duration',18000)]}}
  return {'daily':daily,'daily_units':dict(temperature_2m_mean='°C',temperature_2m_min='°C',temperature_2m_max='°C',precipitation_sum='mm',sunshine_duration='s')}
 def test_sunshine_seconds_are_not_daylight(self):
  result=module.summarize(self.fixture(),2024,2024);self.assertEqual(result[0]['sun'],5);self.assertEqual(result[0]['rain'],62);self.assertEqual(result[1]['rain'],58);self.assertEqual(result[0]['low'],15)
 def test_missing_values_stay_unknown(self):
  data=self.fixture();data['daily']['sunshine_duration']=[None]*366;self.assertIsNone(module.summarize(data,2024,2024)[0]['sun'])
 def test_units_and_duplicate_dates_are_rejected(self):
  data=self.fixture();data['daily_units']['sunshine_duration']='h'
  with self.assertRaises(ValueError):module.summarize(data,2024,2024)
  data=self.fixture();data['daily']['time'][1]=data['daily']['time'][0]
  with self.assertRaises(ValueError):module.summarize(data,2024,2024)

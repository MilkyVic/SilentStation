import {DEFINITION,SCORE_VERSION,type Definition} from './contracts.js';
import {LEGACY_V1_DEFINITION} from './definitions/legacy-v1.js';
export type SurveyRelease = {definition:Definition;scoreVersion:string;channel:'official'|'historical'};
const releases:Record<string,SurveyRelease>={
 [DEFINITION.version]:{definition:DEFINITION,scoreVersion:SCORE_VERSION,channel:'official'},
 [LEGACY_V1_DEFINITION.version]:{definition:LEGACY_V1_DEFINITION,scoreVersion:'survey-arithmetic-v1',channel:'historical'}
};
export function getSurveyRelease(version:string):SurveyRelease|undefined{return Object.hasOwn(releases,version)?releases[version]:undefined;}
export function getSurveyDefinition(version:string):Definition|undefined{return getSurveyRelease(version)?.definition;}

'use client';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './styles.scss'
import { io, Socket } from 'socket.io-client';
import { cloneObj, getEffect, getMonsterBattleImage, getMonsterIcon, getRandomNumber, getRandomNumberAsString, getSkillIcon, getWsUrl, sleep } from '../../common/utils';
import { StartBattleParams, BattleDetails, BattlePageProps, EncounterEffectProps, EncounterImageProps, MonsterEquippedSkillById, PlayerHpBarProps, PlayerMonsterBarProps, EncounterHit, EncounterDamageReceived, SkillUsage, MonsterSkill, Attack, ListenBattleParams, MonsterStats, EncounterHpBarProps, PlayerMonsterImageProps } from '@/@types/battle/types';
import { toast } from 'react-toastify';
import { ELEMENT_CHAOS, ELEMENT_FIRE, ELEMENT_GRASS, ELEMENT_WATER } from '../../common/constants';
import moment from 'moment';
import ElementIcon from '../../components/ElementIcon';
import Spinner from '../../components/Spinner';
import { useUserState } from '@/providers/userStateProvider';
import { useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import { mdiFlagOutline } from '@mdi/js';

let playerMonsterSkills: {[id: string]: MonsterEquippedSkillById } = {};
const AUTO_BATTLE = false;
const ENCOUNTER_INITIAL_DELAY = 5000; // in ms
const CD_ANIMATION_DURATION = 100; // in ms

const Battle = () => {
    const { user } = useUserState();
    const router = useRouter();
    const [ battleDetails, setBattleDetails ] = useState<BattleDetails | undefined>(undefined);
    const [ playerCurrentHp, setPlayerCurrentHp ] = useState(-1);
    const [ encounterCurrentHp, setEncounterCurrentHp ] = useState(-1);
    const [ monsterIdOffCd, setMonsterIdOffCd ] = useState<string | undefined>(undefined);
    const [ encounterDamageReceived, setEncounterDamageReceived ] = useState<EncounterDamageReceived | undefined>(undefined);

    const [ encounterCd, setEncounterCd ] = useState(ENCOUNTER_INITIAL_DELAY);
    const [ encounterMaxCd, setEncounterMaxCd ] = useState(ENCOUNTER_INITIAL_DELAY);

    const [ showVictory, setShowVictory ] = useState(false);
    const [ showDefeat, setShowDefeat ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);

    const isInBattle = useRef<boolean>(false);
    const isNaturalBattleEnd = useRef<boolean>(false);
	const socketRef = useRef<Socket>();

    // for game updates
    useEffect(() => {
        // Create the socket connection if it doesn't exist
        if (!socketRef.current || !socketRef.current.connected) {
            // console.log('attempting connection')
            socketRef.current = io(getWsUrl());

            socketRef.current.on("connect", () => {
                console.log(`connected`);
            });

            // upon disconnection
            socketRef.current.on("disconnect", (reason: any) => {
                console.log(`disconnected due to ${reason}`);
            });
        }

        return () => {
            // cannot off after useRef, else wont get data
            // socketRef.current!.off(`connect`);
            // socketRef.current!.off(`disconnect`);
            // socketRef.current!.off(uuid);
            socketRef.current?.disconnect();
        }

    }, [user.address]);

    const attack = useCallback((address: string, monsterId: number, skillId: number) => {
        if(!socketRef.current) {
            return;
        }

        socketRef.current.emit(`battle_${address}`, {
            type: "player_attack",
            value: {
                id: monsterId,
                skill_id: skillId,
            }
        });
    }, []);

    const surrender = useCallback((address: string, ignoreConfirm = false) => {
        if(!ignoreConfirm) {
            if(!window.confirm('Surrender?')) return;
        }

        if(!socketRef.current) {
            return;
        }

        socketRef.current.emit(`battle_${address}`, {
            type: "flee",
            value: { address }
        });
    }, []);

    //for cd animations
    const setCdTimers = useCallback((cd: number) => {
        let iterationsNeeded = Math.ceil(cd / CD_ANIMATION_DURATION);
        for(let i = 0; i < iterationsNeeded; i++) {
            setTimeout(() => {
                let newCd = cd - ((i + 1) * CD_ANIMATION_DURATION);
                setEncounterCd(newCd);
            }, i * CD_ANIMATION_DURATION);
        }
    }, []);

    const onBattleEnd = useCallback((hasWon: boolean, isInvalid: boolean = false, msg: string = "") => {
        //3s timer
        if(isInvalid) {
            router.push('/home');
            toast.error(msg ?? 'Monsters hibernating');
            socketRef.current?.disconnect();
            return;
        }
        
        if(hasWon) {
            setEncounterCurrentHp(0);

            setTimeout(() => {
                setShowVictory(true);
            }, 2000);
        }

        else {
            setPlayerCurrentHp(0);

            setTimeout(() => {
                setShowDefeat(true);
            }, 1000);
        }

        isNaturalBattleEnd.current = true;
        setEncounterDamageReceived(undefined);
    }, [router]);

    //navigates to battle result after battle end
    const navigateToBattleResult = useCallback(() => {
        router.push(`/battleResult/${battleDetails!.battle_id}`);
    }, [router, battleDetails]);

    //handle when encounters get hit
    const onEncounterReceivedDamage = useCallback(({attacks, encounterHpLeft, monsterId, skillId}: EncounterDamageReceived) => {
        setEncounterCurrentHp(encounterHpLeft);
        setEncounterDamageReceived({attacks, encounterHpLeft, monsterId, skillId});
    }, []);

    //handle when players get hit
    const onDamageReceived = useCallback(({ damage, playerHpLeft, cd /* in s */ }: EncounterHit) => {
        cd = cd * 1000;
        setPlayerCurrentHp(playerHpLeft);
        setEncounterMaxCd(cd);

        // only set cd timers when player is alive
        if(playerHpLeft > 0) {
            setCdTimers(cd);
        }
    }, [setCdTimers]);

    //handle monsters going off cd
    const onMonsterOffCd = useCallback((monsterId: number) => {
        setMonsterIdOffCd(monsterId.toString());

        setTimeout(() => {
            setMonsterIdOffCd(undefined);
        }, 10);
    }, []);

    //display end battle screen
    const onEndSkillsReceived = () => {
        //currently not used
    }
    const startBattle = useCallback(async({
        address,
    }: StartBattleParams ) => {
        if(!socketRef.current) {
            return;
        }

        while(socketRef.current.disconnected) {
            // wait for socket to connect
            await sleep(100);
        }
    
        if(address) {
            socketRef.current.emit('start_battle', {address});
        }
    }, []);

    const listenToBattle = useCallback(({
        address,
        onLoad,
        onEncounterReceivedDamage,
        onDamageReceived,
        onMonsterOffCd,
        onEndSkillsReceived,
        onBattleEnd,
    }: ListenBattleParams) => {
        if(!socketRef.current) {
            return;
        }

        socketRef.current.on('invalid_battle', (msg: string) => { onBattleEnd(false, true, msg) });
        socketRef.current.on('battle_start', (battleDetails: BattleDetails) => {
            onLoad(battleDetails);
            playerMonsterSkills = battleDetails.playerMonsterSkills;
    
            if(AUTO_BATTLE) {
                Object.keys(playerMonsterSkills).forEach(id => {
                    let skillIds = Object.keys(playerMonsterSkills[id]);
                    let skillIndex = getRandomNumber(0, 3, true);
                    let skillId = skillIds[skillIndex];
                    attack(address, parseInt(id), parseInt(skillId));
                });
            }
        })
    
        socketRef.current.on('encounter_hit', ({ damage, playerHpLeft, cd }: EncounterHit) => {
            onDamageReceived({damage, playerHpLeft, cd});
        });
    
        socketRef.current.on('player_monster_off_cd', (monsterId: number) => {
            onMonsterOffCd(monsterId);
    
            if(AUTO_BATTLE) {
                Object.keys(playerMonsterSkills).forEach(id => {
                    let skillIds = Object.keys(playerMonsterSkills[id]);
                    let skillIndex = getRandomNumber(0, 3, true);
                    let skillId = skillIds[skillIndex];
                    attack(address, parseInt(id), parseInt(skillId));
                });
            }
        });
        socketRef.current.on('encounter_damage_received', (dmg: EncounterDamageReceived) => {
            onEncounterReceivedDamage(dmg);
        });
        socketRef.current.on('end_battle_skill_usage', (usage: SkillUsage) => {
            onEndSkillsReceived(usage);
        });
    
        socketRef.current.on('battle_lost', () => {
            onBattleEnd(false);
        });
    
        socketRef.current.on('battle_won', () => {
            onBattleEnd(true);
        });
    
        return () => {
            socketRef.current!.off('invalid_battle');
            socketRef.current!.off('battle_start');
            socketRef.current!.off('encounter_hit');
            socketRef.current!.off('player_monster_off_cd');
            socketRef.current!.off('encounter_damage_received');
            socketRef.current!.off('end_battle_skill_usage');
            socketRef.current!.off('battle_lost');
            socketRef.current!.off('battle_won');
        };
    }, [attack]);

    //constantly listen to events
    useEffect(() => {
        const onLoad = (battleDetails: BattleDetails) => {
            setEncounterCurrentHp(-1);
            setPlayerCurrentHp(-1);
            setBattleDetails(battleDetails);
            setCdTimers(ENCOUNTER_INITIAL_DELAY);
            setIsLoading(false);
        }

        return listenToBattle({
            address: user.address,
            onLoad,
            onBattleEnd,
            onDamageReceived,
            onEncounterReceivedDamage,
            onEndSkillsReceived,
            onMonsterOffCd
        });
    }, [user.address, onBattleEnd, onDamageReceived, onEncounterReceivedDamage, onMonsterOffCd, setCdTimers, listenToBattle]);


    //handle socket connections and clean up
    useEffect(() => {
        if(!user.address) {
            return;
        }

        if(!socketRef.current) {
            return;
        }

        if(socketRef.current.disconnected) {
            socketRef.current.connect();
        }

        return () => {
            if(!isInBattle.current || isNaturalBattleEnd.current) {
                return;
            }

            surrender(user.address, true);
        }
    }, [user.address, surrender]);

    useEffect(() => {
        if(isInBattle.current) {
            return;
        }

        if(!user.address) {
            return;
        }

        if(!socketRef.current) {
            return;
        }

        isInBattle.current = true;

        // console.log('starting battle');

        startBattle({
            address: user.address,
        });
    }, [user.address, startBattle]);

    return (
        <div className='battle-page'>
            <Spinner
                fullScreen
                mode='dark'
                show={isLoading}
                type="pulse"
                text='Tracking'
            />
            <BattlePage 
                address={user.address}
                details={battleDetails}
                playerCurrentHp={playerCurrentHp}
                encounterCurrentHp={encounterCurrentHp}
                monsterIdOffCd={monsterIdOffCd}
                encounterDamageReceived={encounterDamageReceived}
                encounterCd={encounterCd}
                encounterMaxCd={encounterMaxCd}
                ended={showVictory || showDefeat}
                attack={attack}
                surrender={surrender}
            />
            {
                showVictory &&
                <div className="result-indicator victory">
                    <strong>Victory</strong>
                </div>
            }
            {
                showDefeat &&
                <div className="result-indicator defeat">
                    <strong>Defeat</strong>
                </div>
            }
            {
                (showVictory || showDefeat) &&
                <div className="result-navigate-button">
                    <button onClick={navigateToBattleResult}>Show Result</button>
                </div>
            }
        </div>
    )
}

const BattlePage = ({
    address, 
    details, 
    playerCurrentHp, 
    encounterCurrentHp, 
    monsterIdOffCd, 
    encounterDamageReceived, 
    encounterCd, 
    encounterMaxCd, 
    ended, 
    attack, 
    surrender,
}: BattlePageProps) => {
    const [activeMonsterId, setActiveMonsterId] = useState<string>("");
    const [monstersOnCd, setMonstersOnCd] = useState<{[monsterId: string]: number}>({});

    let previousMonstersOnCd = useRef<{[monsterId: string]: number}>({});
    let monsterCount = useRef(0);

    //init
    let playerMaxHp = useMemo(() => {
        if(!details) {
            return 0;
        }
        return Object.values(details.playerMonsters).map(x => x.hp).reduce((a,b) => a+b);
    }, [details]);

    let monsterMaxHp = useMemo(() => {
        if(!details) {
            return 0;
        }
        return details.encounter.hp;
    }, [details]);

    //set on / off cd
    useEffect(() => {
        if(!monsterIdOffCd) {
            return;
        }

        let cloned = cloneObj<{[monsterId: string]: number}>(previousMonstersOnCd.current);
        delete cloned[monsterIdOffCd];
        setMonstersOnCd(cloned);
    }, [monsterIdOffCd, details]);


    //register current monsters on cd
    useEffect(() => {
        previousMonstersOnCd.current = cloneObj<{[monsterId: string]: number}>(monstersOnCd);
        let monsterIdsOnCd = Object.keys(monstersOnCd);

        // there are other active monsters
        if(details && (monsterIdsOnCd.includes(activeMonsterId) || !activeMonsterId)) {
            let nextActiveIds = Object.keys(details.playerMonsters).filter(x => !monsterIdsOnCd.includes(x));

            // set next active id if there are
            if(nextActiveIds.length > 0) {
                setActiveMonsterId(nextActiveIds[0]);
            }
        }
    }, [monstersOnCd, activeMonsterId, details]);

    // set skill click effects
    const onSkillClick = useCallback((monsterId: string, endTime: number) => {
        if(Object.keys(monstersOnCd).includes(monsterId)) {
            // toast.error('Guardians need rest!');
            return;
        }

        let cloned = cloneObj<{[monsterId: string]: number}>(monstersOnCd);
        cloned[monsterId] = endTime;
        setMonstersOnCd(cloned);

        // there are other active monsters
        if(cloned.length < monsterCount.current && details) {
            let monsterIdsOnCd = Object.keys(cloned);
            let nextActiveId = Object.keys(details!.playerMonsters).filter(x => !monsterIdsOnCd.includes(x))[0];
            setActiveMonsterId(nextActiveId);
        }
    }, [monstersOnCd, details]);

    // add hotkeys
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if(!details) {
                return;
            }

            let { playerMonsterSkills } = details;
            let nonEmptyActiveMonsterId = activeMonsterId === ""? Object.keys(playerMonsterSkills)[0] : activeMonsterId;

            const getSkillId = (index: number) => {
                return parseInt(Object.keys(playerMonsterSkills[nonEmptyActiveMonsterId])[index]);
            }

            const getSkillCd = (index: number) => {
                let skillId = getSkillId(index);
                return playerMonsterSkills[nonEmptyActiveMonsterId][skillId].cooldown;
            }

            /* const getMonsterId = (index: number) => {
                let { playerMonsterSkills } = details;
                return Object.keys(playerMonsterSkills)[index];
            } */

            let endTime = 0;
            switch(e.key.toLowerCase()) {
                case "q":
                    attack(address, parseInt(nonEmptyActiveMonsterId), getSkillId(0));
                    endTime = moment().unix() + getSkillCd(0) * 1000;
                    onSkillClick(nonEmptyActiveMonsterId, endTime);
                    break;
                case "w":
                    attack(address, parseInt(nonEmptyActiveMonsterId), getSkillId(1));
                    endTime = moment().unix() + getSkillCd(1) * 1000;
                    onSkillClick(nonEmptyActiveMonsterId, endTime);
                    break;
                case "e":
                    attack(address, parseInt(nonEmptyActiveMonsterId), getSkillId(2));
                    endTime = moment().unix() + getSkillCd(2) * 1000;
                    onSkillClick(nonEmptyActiveMonsterId, endTime);
                    break;
                case "r":
                    attack(address, parseInt(nonEmptyActiveMonsterId), getSkillId(3));
                    endTime = moment().unix() + getSkillCd(3) * 1000;
                    onSkillClick(nonEmptyActiveMonsterId, endTime);
                    break;
                default:
                    break;
            }
        }

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [activeMonsterId, details, address, onSkillClick, attack]);

    // set monster count
    useEffect(() => {
        if(!details) {
            return;
        }

        monsterCount.current = Object.keys(details.playerMonsters).length;
    }, [details]);

    // surrender
    const onSurrender = useCallback(() => {
        surrender(address);
    }, [address, surrender]);

    if(!details) {
        return null;
    }

    let { playerMonsters, playerMonsterSkills, encounter } = details;
    let nonNullActiveMonsterId = activeMonsterId ?? Object.keys(playerMonsterSkills)[0];

    return (
        <div className={`battle-container ${ended? 'end' : ''}`}>
            <EncounterHpBar
                name={`${encounter.name}${encounter.is_shiny? '*' : ''}`}
                currentHp={encounterCurrentHp === -1? monsterMaxHp : encounterCurrentHp}
                maxHp={monsterMaxHp}
                cd={encounterCd}
                maxCd={encounterMaxCd}
                elementId={encounter.element_id}
            />
            <EncounterImage 
                encounter={encounter}
                encounterDamageReceived={encounterDamageReceived}
                playerMonsterSkills={playerMonsterSkills}
                battleWon={encounterCurrentHp === 0}
            />
            <PlayerHpBar
                name='You'
                currentHp={playerCurrentHp === -1? playerMaxHp : playerCurrentHp}
                maxHp={playerMaxHp}
            />
            <PlayerMonsterBar
                playerMonsters={playerMonsters}
                onPlayerMonsterClick={(monsterId)=> {setActiveMonsterId(monsterId)}}
                monstersOnCd={monstersOnCd}
                activeMonsterId={nonNullActiveMonsterId}
                playerMonsterSkills={playerMonsterSkills}
                onSkillClick={onSkillClick}
                address={address}
                attack={attack}
            />
            <button className="flee-button" onClick={onSurrender}>
                <span>Surrender</span>
                <Icon path={mdiFlagOutline} size={1}/>
            </button>
        </div>
    );
}

const EncounterImage = ({ encounter, encounterDamageReceived, playerMonsterSkills, battleWon }: EncounterImageProps) => {
    const [currentEffects, setCurrentEffects] = useState<string[]>([]);
    const effects = useRef<string[]>([]);

    useEffect(() => {
        if(!encounterDamageReceived) {
            return;
        }

        let { skillId, monsterId } = encounterDamageReceived;

        if(!playerMonsterSkills[encounterDamageReceived.monsterId]) {
            return;
        }
        if(!playerMonsterSkills[monsterId][skillId]) {
            return;
        }

        effects.current.push(playerMonsterSkills[monsterId][skillId].effect_file);
        setCurrentEffects(cloneObj(effects.current));

        setTimeout(() => {
            effects.current.pop();
            setCurrentEffects(cloneObj(effects.current));
        }, 800);
    }, [encounterDamageReceived, playerMonsterSkills]);

    return (
        <div className='encounter-img-container'>
            {/* <span>{encounter.element_name} {encounter.name}{encounter.is_shiny? '*' : ''}</span> */}
            <img className={`encounter-img ${battleWon? 'dead' : ''} ${battleWon? 'shake' : ''}`} src={getMonsterBattleImage(encounter.img_file, encounter.is_shiny)} alt="encounter_img"></img>
            {
                Object.entries(playerMonsterSkills).map(([monsterId, skills], index) => (
                    <EncounterDamagedNumbers
                        encounterDamageReceived={encounterDamageReceived}
                        skills={skills}
                        monsterId={monsterId}
                        attackIndex={index}
                        key={`damage-numbers-${index}`}
                    />
                ))
            }

            {
                currentEffects.map((x, index) => (
                    <div className='effect-container' key={`effect-${x}-${index}`}>
                        <img src={getEffect(x)} alt="effect"></img>
                    </div>
                ))
            }
        </div>
    );
}

const EncounterDamagedNumbers = ({ encounterDamageReceived, skills, attackIndex, monsterId }: EncounterEffectProps) => {
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const [randomLocations, setRandomLocations] = useState([["0%", "0%"]]);

    // set damage numbers
    useEffect(() => {
        //no damage dont do anything
        if(!encounterDamageReceived) {
            return;
        }

        //not current monster
        if(encounterDamageReceived.monsterId.toString() !== monsterId) {
            return;
        }

        //no skill
        if(!skills[encounterDamageReceived.skillId.toString()]) {
            return;
        }

        setAttacks([]);

        let newLocations: string[][] = [];

        for(var i = 0; i < encounterDamageReceived.attacks.length; i++) {
            let randomBottom = getRandomNumberAsString(20, 80) + "%";
            let randomLeft = getRandomNumberAsString(30, 60) + "%";
            newLocations.push([randomBottom, randomLeft]);
        }

        // setRandomBottom(randomBottom);
        // setRandomLeft(randomLeft);

        setRandomLocations(newLocations);

        setTimeout(() => {
            setAttacks(encounterDamageReceived.attacks);
        }, 10);

    }, [encounterDamageReceived, skills, monsterId]);

    return (
        <div className={`attacks`}>
            {
                attacks.map((x, index) => {
                    let damage = x.damage.toFixed(0);
                    let [bottom, left] = randomLocations[index];

                    let element = "";

                    switch(x.element_id) {
                        case ELEMENT_GRASS:
                            element = "grass";
                            break;
                        case ELEMENT_FIRE:
                            element = "fire";
                            break;
                        case ELEMENT_WATER:
                            element = "water";
                            break;
                        case ELEMENT_CHAOS:
                            element = "chaos";
                            break;
                        default:
                            element = "chaos";
                            break;
                    }

                    let attackDiv = null;

                    switch(x.type) {
                        case "immune":
                            attackDiv = <div className={`attack immune ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>Immune</div>;
                            break;

                        case "miss":
                            attackDiv = <div className={`attack miss ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>Miss</div>;
                            break;

                        case "crit":
                            attackDiv = <div className={`attack crit ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>{damage}</div>;
                            break;
                        case "normal":
                            attackDiv = <div className={`attack normal ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>{damage}</div>;
                            break;

                        default:
                            break;
                    }

                    return attackDiv;
                })
            }
            {
                attacks.map((x, index) => {

                    let newTotalDamage = 0;
                    let cloned = cloneObj<Attack[]>(attacks);
                    newTotalDamage = cloned.filter((_, _index) => _index <= index).map(x => x.damage).reduce((a,b) => a+b);

                    let element = "";

                    switch(x.element_id) {
                        case ELEMENT_GRASS:
                            element = "grass";
                            break;
                        case ELEMENT_FIRE:
                            element = "fire";
                            break;
                        case ELEMENT_WATER:
                            element = "water";
                            break;
                        case ELEMENT_CHAOS:
                            element = "chaos";
                            break;
                        default:
                            element = "chaos";
                            break;
                    }

                    //last attack will always show as crit element
                    return (
                        <span className={`attack-total attack-index-${attackIndex} ${index === attacks.length - 1? 'crit' : x.type} ${element}`} key={`attack-total-${attackIndex}-${index}`}>{newTotalDamage.toFixed(0)}</span>
                    );
                })
            }
        </div>
    );
}

const EncounterHpBar = ({ currentHp, maxHp, name, maxCd, cd, elementId }: EncounterHpBarProps) => {
    currentHp = currentHp < 0? 0 : currentHp;
    let pct = Math.ceil((currentHp * 100/ maxHp));
    pct = pct > 100? 100: pct;

    let cdPct = 0;
    if(cd && maxCd) {
        cdPct = Math.ceil((cd * 100/ maxCd));
    }

    return (
        <div className="hp-bar encounter">
            <div className="hp-left encounter" style={{ width: `${pct}%` }}></div>
            <div className="cd-left encounter" style={{ width: `${cdPct}%` }}></div>
            <div className='hp-number'>
                <span>{currentHp.toFixed(0)} / {maxHp.toFixed(0)}</span>
            </div>
            {
                name &&
                <div className='hp-name'>
                    <ElementIcon
                        elementId={elementId}
                    />
                    <span>{name}</span>
                </div>
            }
        </div>
    )
}

const PlayerHpBar = ({ currentHp, maxHp, name }: PlayerHpBarProps) => {
    currentHp = currentHp < 0? 0 : currentHp;
    let pct = Math.ceil((currentHp * 100/ maxHp));
    pct = pct > 100? 100: pct;
    return (
        <div className="hp-bar">
            <div className="hp-left" style={{ width: `${pct}%`, backgroundColor: 'greenyellow' }}></div>
            <div className='hp-number'>
                <span>{currentHp.toFixed(0)} / {maxHp.toFixed(0)}</span>
            </div>
            {
                name &&
                <div className='hp-name'>
                    <span>{name}</span>
                </div>
            }
        </div>
    )
}

const PlayerMonsterBar = ({ playerMonsters, playerMonsterSkills, onPlayerMonsterClick, monstersOnCd, activeMonsterId, onSkillClick, address, attack }: PlayerMonsterBarProps) => {
    const [currentActiveMonsterId, setCurrentActiveMonsterId] = useState("");
    const [currentActiveMonster, setCurrentActiveMonster] = useState<MonsterStats | undefined>(undefined);
    const [currentSkills, setCurrentSkills] = useState<MonsterSkill[]>([]);

    // set active monster
    useEffect(() => {
        if(!activeMonsterId && Object.values(playerMonsters).length === 0) {
            return;
        }

        let nonEmptyActiveId = !activeMonsterId? Object.keys(playerMonsters)[0] : activeMonsterId;

        setCurrentActiveMonsterId(nonEmptyActiveId);
        setCurrentActiveMonster(playerMonsters[nonEmptyActiveId]);
    }, [activeMonsterId, playerMonsters]);

    //set current skills
    useEffect(() => {
        if(!activeMonsterId && Object.values(playerMonsterSkills).length === 0) {
            return;
        }

        let nonEmptyActiveId = !activeMonsterId? Object.keys(playerMonsterSkills)[0] : activeMonsterId;
        let skills = Object.values(playerMonsterSkills[nonEmptyActiveId]);

        setCurrentSkills(skills);
    }, [activeMonsterId, playerMonsterSkills]);

    const onInternalSkillClick = (skillId: number) => {
        let nonEmptyActiveId = !activeMonsterId? Object.keys(playerMonsterSkills)[0] : activeMonsterId;
        attack(address, parseInt(nonEmptyActiveId), skillId);
        let endTime = moment().unix() + playerMonsterSkills[nonEmptyActiveId][skillId].cooldown * 1000;
        onSkillClick(nonEmptyActiveId, endTime);
    }

    if(!currentActiveMonster) {
        // set timer
        return null;
    }

    return (
        <div className="player-monster-bar">
            <div className="player-monster-container">
                {
                    Object.entries(playerMonsters).sort((a, _) => (currentActiveMonsterId === a[0]? -1 : 1)).map((x, index) => {
                        const [monsterId, monster] = x;

                        return (
                        <div 
                            key={`player-monster-${monsterId}`}
                            className={`player-monster`}
                            onClick={() => { onPlayerMonsterClick(monsterId) }}
                        >
                            <PlayerMonsterImage
                                monster={monster}
                                endTime={monstersOnCd[monsterId]}
                            />
                            {
                                index === 0 &&
                                <>
                                    <button 
                                        className={`skill-button ${monstersOnCd[monsterId]? 'on-cd' : ''}`}
                                        onClick={() => { onInternalSkillClick(currentSkills[0].id) }}
                                    >
                                        <span>Q</span>
                                        <div className="element-icon-container">
                                            <ElementIcon
                                                elementId={currentSkills[0].element_id}
                                                size={10}
                                            />
                                        </div>
                                        <img src={getSkillIcon(currentSkills[0].icon_file)} alt="skill_icon" />
                                    </button>
                                    <button 
                                        className={`skill-button ${monstersOnCd[monsterId]? 'on-cd' : ''}`}
                                        onClick={() => { onInternalSkillClick(currentSkills[1].id) }}
                                    >
                                        <span>W</span>
                                        <div className="element-icon-container">
                                            <ElementIcon
                                                elementId={currentSkills[1].element_id}
                                                size={10}
                                            />
                                        </div>
                                        <img src={getSkillIcon(currentSkills[1].icon_file)} alt="skill_icon" />
                                    </button>
                                    <button 
                                        className={`skill-button ${monstersOnCd[monsterId]? 'on-cd' : ''}`}
                                        onClick={() => { onInternalSkillClick(currentSkills[2].id) }}
                                    >
                                        <span>E</span>
                                        <div className="element-icon-container">
                                            <ElementIcon
                                                elementId={currentSkills[2].element_id}
                                                size={10}
                                            />
                                        </div>
                                        <img src={getSkillIcon(currentSkills[2].icon_file)} alt="skill_icon" />
                                    </button>
                                    <button 
                                        className={`skill-button ${monstersOnCd[monsterId]? 'on-cd' : ''}`}
                                        onClick={() => { onInternalSkillClick(currentSkills[3].id) }}
                                    >
                                        <span>R</span>
                                        <div className="element-icon-container">
                                            <ElementIcon
                                                elementId={currentSkills[3].element_id}
                                                size={10}
                                            />
                                        </div>
                                        <img src={getSkillIcon(currentSkills[3].icon_file)} alt="skill_icon" />
                                    </button>
                                </>
                            }
                        </div>);
                    })
                }
            </div>
        </div>
    )
}

const PlayerMonsterImage = ({monster, endTime}: PlayerMonsterImageProps) => {
    const [countdown, setCountdown] = useState(0);

    const setCdTimers = useCallback((cd: number) => {
        let iterationsNeeded = Math.ceil(cd / CD_ANIMATION_DURATION);
        for(let i = 0; i < iterationsNeeded; i++) {
            setTimeout(() => {
                let newCd = cd - ((i + 1) * CD_ANIMATION_DURATION);
                setCountdown(newCd);
            }, i * CD_ANIMATION_DURATION);
        }
    }, []);

    useEffect(() => {
        let now = moment().unix();
        if(!endTime || endTime < now) {
            return;
        }

        setCdTimers(endTime - now);
    }, [endTime, setCdTimers]);

    return (
        <div className="player-monster-image-container">
            <img src={getMonsterIcon(monster.img_file, monster.element_id, monster.is_shiny)} alt="imageFile"></img>
            {
                countdown &&
                <div className="cd-container">
                    {(countdown / 1000).toFixed(1)}s
                </div>
            }
        </div>
    )
}

export default Battle;
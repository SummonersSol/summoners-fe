'use client';
import React, { useCallback, useEffect, useState, useContext, useMemo } from 'react';
import axios from '@/services/axios';
import _ from 'lodash';
import { getMonsterIcon, cloneObj, getSkillIcon } from '../../common/utils';
import LoadingIndicator from '@/components/Spinner';
import { toast } from 'react-toastify';
import BackButton from '@/components/BackButton';
import ElementIcon from '@/components/ElementIcon';
import { Mob } from '@/@types/inventory/types';
import { useUserState } from '@/providers/userStateProvider';
import { useRouter } from 'next/navigation';
import { faArrowDown, faArrowUp, faArrowUp19, faArrowUpShortWide, faRefresh } from '@fortawesome/free-solid-svg-icons'
import './styles.scss'; // too complicated to change to tailwind
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOptinMonster } from '@fortawesome/free-brands-svg-icons';

const Page = () => {
    const { user } = useUserState();
    const router = useRouter();

    // set loading state
    const [isLoading, setIsLoading] = useState(false);
    // store all monster
    const [mob, setMob] = useState<Mob[]>([]);
    // store selected monster (onclick)
    const [selectedMob, setSelectedMob] = useState<Mob | null>(null);
    // for pagination purpose
    const [skip, setSkip] = useState(0);
    // each page up/page down will reload 1 row (5mobs)
    const skipStep = 5;
    // limit monster display per pagination
    const take = 15;
    const maxEquipped = 4;

    const getInventory = useCallback(async () => {
        if (!user.address) {
            return;
        }
        try {
            setIsLoading(true);
            let res = await axios.post(`/game/inventory`, {
                address: user.address
            });

            let mob = res.data;
            // set mob isBridging (so we can display more bridging info based on state here)
            setMob(mob);
        } catch(e) {
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, [user.address]);

    useEffect(() => {
        setSelectedMob(null);
        getInventory();
    }, [getInventory]);

    const equippedMonster = useMemo(() => {
        return mob.filter(x => x.equipped);
    }, [mob]);

    const unequippedMonsterPaginated = useMemo(() => {
        return mob.filter((x, index) => !x.equipped && index >= skip && index < skip + take);
    }, [mob, skip]);

    const selectMob = useCallback((m: Mob) => {
        setSelectedMob(m);
    }, []);

    const navigateUp = useCallback(() => {
        const newSkip = skip - skipStep >= 0 ? skip - skipStep : skip;
        setSkip(newSkip)
    }, [skip])

    const navigateDown = useCallback(() => {
        // if item less than 15, do not let it scroll down
        if (_.size(mob) > take) {
            const newSkip = skip + skipStep < mob.length ? skip + skipStep : skip;
            setSkip(newSkip)
        }
    }, [skip, mob])

    const EquippedMonster = useCallback(() => {

        let component: JSX.Element[] = [];
        for (let index = 0; index < maxEquipped; index++) {
            const m = equippedMonster[index];
            if (m) {
                component.push(
                    <div key={`mob-equipped-${index}`} className={`mob-slot ${selectedMob && m.id === selectedMob.id? 'selected' : ''}`} onClick={() => selectMob(m)}>
                        <div className="slotLabel">{index+1}</div>
                        <img src={getMonsterIcon(m.img_file, m.element_id, m.is_shiny)} alt="monster_icon"/>
                    </div>
                )
            } else {
                component.push(
                    <div key={`mob-equipped-${index}`} className="mob-slot empty">
                        <div className="slotLabel">{index+1}</div>
                    </div>
                )
            }
        }
        return component;
    }, [equippedMonster, selectMob, selectedMob]);


    /**
     * Use mob in battle
     * @date 2022-10-06
     */
     const equipMob = useCallback(async () => {
         if(!selectedMob) {
            return;
         }

         if(!user.address) {
            return;
         }

        try {
            // setIsLoading(true);
            let res = await axios.post(`/game/equipMob`, {
                address: user.address,
                monsterId: selectedMob.id
            });

            if (res.data) {
                // set unequipped in state
                const currMob = cloneObj(mob);
                _.map(currMob, (m, mIndex) => {
                    // console.log(`m.id: ${m.id} | selectedMob.id: ${selectedMob.id}`);
                    if (m.id === selectedMob.id) {
                        // console.log(`set equip to 1`);
                        currMob[mIndex].equipped = true;
                    }
                });
                setMob(currMob);
                setSelectedMob(null);

                // refresh subMob list & equipped list
                setSkip(0);
                toast.success(<div>Added <b>{selectedMob.name}</b> to party</div>);
            } else {
                toast.error(<div>Failed to equip <b>{selectedMob.name}</b></div>);
            }

            // setIsLoading(false);
        } catch(e) {
            // console.log(e);
            // setIsLoading(false);
        }
    }, [user.address, mob, selectedMob]);

    /**
     * Remove mob from battle
     * @date 2022-10-06
     */
     const unequipMob = useCallback(async () => {
         if(!selectedMob) {
             return;
         }

         if(!user.address) {
            return;
         }

        try {
            // setIsLoading(true);
            let res = await axios.post(`/game/unequipMob`, {
                address: user.address,
                monsterId: selectedMob.id
            });

            if (res.data) {
                // set unequipped in state
                const currMob = cloneObj(mob);
                _.map(currMob, (m, mIndex) => {
                    if (m.id === selectedMob.id) {
                        currMob[mIndex].equipped = false;
                    }
                });
                // update all mob
                setMob(currMob);
                setSelectedMob(null);

                // refresh subMob list & equipped list
                setSkip(0);
                toast.success(<div>Removed <b>{selectedMob.name}</b> from party</div>);
            } else {
                toast.error(<div>Failed to unequip <b>{selectedMob.name}</b></div>);
            }

            // setIsLoading(false);
        } catch(e) {
            // console.log(e);
            // setIsLoading(false);
        }
    }, [user.address, mob, selectedMob]);

    const InfoSlot = useCallback(() => {
        let mobSkills: JSX.Element[] = [];
        let mobName = '';
        let mobStats: JSX.Element = (<div className="mob-stats-slot"></div>);
        let elementId = null;

        if (selectedMob) {
            mobName = selectedMob.name;

            elementId = selectedMob.element_id;
            _.map(selectedMob.skills, (sm, smIndex) => {
                /* const popover = (
                    <Popover id="popover-basic" key={`info-slot-index-${smIndex}`}>
                        <Popover.Header as="h3">
                            <div className="mob-skill-stats">
                                <ElementIcon
                                    elementId={sm.element_id}
                                />{sm.name}
                            </div>
                        </Popover.Header>
                        <Popover.Body>
                            Hits: {sm.hits}<br/>
                            Damage: {sm.damage}%<br/>
                            Accuracy: {sm.accuracy}<br />
                            Cooldown: {sm.cooldown}s<br />
                        </Popover.Body>
                    </Popover>
                ); */

                mobSkills.push(
                    // <OverlayTrigger key={`mob-skill-overlay-${smIndex}`} rootClose={true} trigger="click" placement="right-end" overlay={popover} delay={{ show: 50, hide: 50 }}>
                        <button className="mob-skill-icon">
                            <img className={sm.element} alt={sm.name} src={getSkillIcon(sm.icon_file)} />
                        </button>
                    // </OverlayTrigger>
                )
            })

            mobStats = (
                <div className="mob-stats-slot">
                    <div>
                        <div className="mob-stats">
                            <span>ATT</span>
                            <span>{selectedMob.attack}</span>
                        </div>
                        <div className="mob-stats">
                            <span>LIFE</span>
                            <span>{selectedMob.hp}</span>
                        </div>
                    </div>
                    <div>
                        <div className="mob-stats">
                            <span>DEF</span>
                            <span>{selectedMob.defense}</span>
                        </div>
                        <div className="mob-stats">
                            <span>CRIT</span>
                            <span>{selectedMob.crit_chance}</span>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="big-slot">
                <div className="mob-skills">
                    {mobSkills}
                </div>
                <div className="mob-info">
                    <div className="mob-name">
                        {elementId && <ElementIcon
                            elementId={elementId}
                        />}
                        <h5>{mobName}</h5>
                    </div>
                    {mobStats}
                </div>
            </div>
        )
    }, [selectedMob]);

    const MonsterListing = useCallback(() => {
        let component: JSX.Element[] = [];
        for (let index = 0; index < take; index++) {
            const m = unequippedMonsterPaginated[index];
            if (m) {
                component.push(
                    <div key={`mob-listing-${index}`} className={`slot ${selectedMob && m.id === selectedMob.id? 'selected' : ''}`} onClick={() => selectMob(m)}>
                        <img src={getMonsterIcon(m.img_file, m.element_id, m.is_shiny)} alt="monster_icon"/>
                    </div>
                )
            } else {
                component.push(
                    <div key={`mob-listing-${index}`} className="slot empty">
                    </div>
                )
            }
        }
        return component;
    }, [unequippedMonsterPaginated, selectMob, selectedMob]);

    const ActionButton = useCallback(() => {
        let component: JSX.Element;
        if (selectedMob && selectedMob.equipped) {
            component = (
                <div className="actions">
                    <button onClick={unequipMob}>DROP</button>
                </div>
            );
        } else {
            component = (
                <div className="actions">
                    <button onClick={equipMob}>USE</button>
                </div>
            );
        }
        return component;
    }, [equipMob, selectedMob, unequipMob]);

    return (
        <div className="relative w-full h-full items-center justify-center flex">

            <div className="inventory-page container">
                <BackButton
                    onButtonClick={() => router.push('/home')}
                />

                <div className="inventory">
                    <div className="title groovy">
                        <div className="text">INVENTORY</div>
                    </div>

                    {/* equipped */}
                    <div className="equipment groovy">
                        <div className="label-slot">
                            <div className="label-placeholder">
                                <span className="equipped">In-Use</span>
                                <FontAwesomeIcon
                                    icon={faOptinMonster}
                                    size='1x'
                                    className='label-icon'
                                />
                            </div>
                        </div>
                        { EquippedMonster() }
                    </div>

                    <div className="bag groovy">
                        <div className="top-part">
                            { MonsterListing() }
                        </div>

                        {/* description part */}
                        <div className="divider">
                            <div className="small-slot"></div>
                        </div>

                        {/* description box */}
                        <div className="description">
                            <InfoSlot />
                        </div>
                        <ActionButton />
                    </div>
                    <ul className="tabs">
                        <li>
                            <button
                                className="navigation"
                                onClick={navigateUp}
                            >
                               <FontAwesomeIcon
                                    icon={faArrowUp}
                                    size={'sm'}
                               />
                            </button>
                        </li>
                        <li>
                            <button
                                className="navigation"
                                onClick={navigateDown}
                            >
                                <FontAwesomeIcon
                                    icon={faArrowDown}
                                    size={'sm'}
                                />
                            </button>
                        </li>
                        <li>
                            <button
                                className="navigation"
                                onClick={() => getInventory()}
                            >
                                <FontAwesomeIcon
                                    icon={faRefresh}
                                    size={'sm'}
                                />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <LoadingIndicator
                show={isLoading}
                type={"pulse"}
                mode={"dark"}
                text={"Loading.."}
                fullScreen
            ></LoadingIndicator>
        </div>
    )
}


export default Page;